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
    const requestOptions = {timeout: 15000};

    describe('searchBooks()', () => {
        it('should fetch real data for "The Great Gatsby"', () => {
            cy.wrap(searchBooks('the great gatsby'), requestOptions).then((res: OpenLibrarySearchResponse) => {
                expect(res.docs.length).to.be.greaterThan(0);
                const titles = res.docs.map(d => d.title.toLowerCase());
                expect(titles.some(t => t.includes('the great gatsby'))).to.be.true;
            });
        });

        it('should handle empty query error (Logicielle)', () => {
            cy.wrap(searchBooks('').catch(err => err)).then((error: any) => {
                expect(error.message).to.equal('Search query cannot be empty');
            });
        });
    });

    describe('getBookByKey()', () => {
        it('should fetch actual book details for OL45804W', () => {
            const key = '/works/OL45804W';
            cy.wrap(getBookByKey(key), requestOptions).then((book: OpenLibraryWork) => {
                expect(book.title).to.equal('Fantastic Mr Fox');
                expect(book.key).to.equal(key);
            });
        });
    });

    describe('getAuthorByKey()', () => {
        it('should fetch actual author details for William Shakespeare', () => {
            const key = '/authors/OL9388A';
            cy.wrap(getAuthorByKey(key), requestOptions).then((author: OpenLibraryAuthor) => {
                expect(author.name).to.equal('William Shakespeare');
            });
        });
    });

    describe('getRecentBookAdditions()', () => {
        it('should fetch a dynamic list of recent books from API', () => {
            cy.wrap(getRecentBookAdditions(3), {timeout: 30000}).then((books: OpenLibraryWork[]) => {
                expect(books).to.be.an('array');

                if (books.length > 0) {
                    expect(books[0]).to.have.property('title');
                    expect(books[0].covers).to.have.length.greaterThan(0);
                    console.log('Books found on real API:', books.map(b => b.title));
                }
            });
        });
    });

    describe('Advanced Search', () => {
        it('should filter by title and author on real API', () => {
            cy.wrap(advancedSearch({
                title: 'Lord of the Rings',
                author: 'Tolkien'
            }), requestOptions).then((res: OpenLibrarySearchResponse) => {
                expect(res.docs.length).to.be.greaterThan(0);
                expect(res.docs[0].author_name).to.deep.include('J.R.R. Tolkien');
            });
        });
    });
});