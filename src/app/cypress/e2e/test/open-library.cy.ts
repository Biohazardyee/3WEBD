/// <reference types="cypress" />

import {
    searchBooks,
    advancedSearch,
    getBookByKey,
    getAuthorByKey,
    getRecentBookAdditions,
} from '../../../src/api/openLibrary';

import {
    OpenLibrarySearchResponse,
    OpenLibraryWork,
    OpenLibraryAuthor,
} from '../../../src/types/openLibrary';

describe('OpenLibrary Real API Integration Tests', () => {
    // On augmente le timeout global car l'API réelle est plus lente que les mocks
    const requestOptions = {timeout: 15000};

    describe('searchBooks()', () => {
        it('should fetch real data for "The Great Gatsby"', () => {
            cy.wrap(searchBooks('the great gatsby'), requestOptions).then((res: any) => {
                const result = res as OpenLibrarySearchResponse;
                expect(result.docs.length).to.be.greaterThan(0);
                // On vérifie qu'un des résultats contient bien le titre attendu
                const titles = result.docs.map(d => d.title.toLowerCase());
                expect(titles.some(t => t.includes('the great gatsby'))).to.be.true;
            });
        });

        it('should handle empty query error (Logicielle)', () => {
            // Cette erreur est déclenchée par ton code, pas par l'API
            cy.wrap(searchBooks('').catch(err => err)).then((error: any) => {
                expect(error.message).to.equal('Search query cannot be empty');
            });
        });
    });

    describe('getBookByKey()', () => {
        it('should fetch actual book details for OL45804W', () => {
            const key = '/works/OL45804W';
            cy.wrap(getBookByKey(key), requestOptions).then((book: any) => {
                const result = book as OpenLibraryWork;
                expect(result.title).to.equal('Fantastic Mr Fox');
                expect(result.key).to.equal(key);
            });
        });
    });

    describe('getAuthorByKey()', () => {
        it('should fetch actual author details for William Shakespeare', () => {
            const key = '/authors/OL9388A';
            cy.wrap(getAuthorByKey(key), requestOptions).then((author: any) => {
                const result = author as OpenLibraryAuthor;
                expect(result.name).to.equal('William Shakespeare');
            });
        });
    });

    describe('getRecentBookAdditions()', () => {
        it('should fetch a dynamic list of recent books from API', () => {
            cy.wrap(getRecentBookAdditions(3), {timeout: 30000}).then((books: any) => {
                const result = books as OpenLibraryWork[];
                expect(result).to.be.an('array');

                if (result.length > 0) {
                    expect(result[0]).to.have.property('title');
                    expect(result[0].covers).to.have.length.greaterThan(0);
                    console.log('Books found on real API:', result.map(b => b.title));
                }
            });
        });
    });

    describe('Advanced Search', () => {
        it('should filter by title and author on real API', () => {
            cy.wrap(advancedSearch({
                title: 'Lord of the Rings',
                author: 'Tolkien'
            }), requestOptions).then((res: any) => {
                const result = res as OpenLibrarySearchResponse;
                expect(result.docs.length).to.be.greaterThan(0);
                expect(result.docs[0].author_name).to.deep.include('J.R.R. Tolkien');
            });
        });
    });
});