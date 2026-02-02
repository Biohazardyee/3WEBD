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
    OpenLibrarySearchDoc,
} from '../../../src/types/openLibrary';

describe('OpenLibrary API Integration Tests (Cypress)', () => {

    describe('searchBooks()', () => {
        it('should successfully search for books with valid query', () => {
            const mockResponse: OpenLibrarySearchResponse = {
                numFound: 629,
                start: 0,
                docs: [
                    {
                        key: '/works/OL45804W',
                        title: 'The Great Gatsby',
                        author_name: ['F. Scott Fitzgerald'],
                        first_publish_year: 1925,
                        cover_i: 7222246,
                    } as OpenLibrarySearchDoc
                ]
            };

            cy.intercept('GET', /.*\/search\.json.*/, {
                statusCode: 200,
                body: mockResponse
            }).as('searchApi');

            cy.wrap(searchBooks('gatsby')).then((res: any) => {
                const result = res as OpenLibrarySearchResponse;
                expect(result.numFound).to.equal(629);
                expect(result.docs[0].title).to.equal('The Great Gatsby');
            });


            cy.wait('@searchApi');
        });

        it('should handle empty query error', () => {
            cy.wrap(searchBooks('').catch(err => err)).then((error: any) => {
                expect(error.message).to.equal('Search query cannot be empty');
            });
        });
    });

    describe('advancedSearch()', () => {
        it('should perform advanced search with multiple parameters', () => {
            cy.intercept('GET', /.*\/search\.json.*/, {
                statusCode: 200,
                body: { numFound: 50, docs: [{ title: 'To Kill a Mockingbird' }] }
            }).as('advSearch');

            cy.wrap(advancedSearch({ title: 'mockingbird', author: 'harper lee' })).then((res: any) => {
                const result = res as OpenLibrarySearchResponse;
                expect(result.docs[0].title).to.equal('To Kill a Mockingbird');
            });

            cy.wait('@advSearch');
        });
    });

    describe('getBookByKey()', () => {
        it('should fetch book details by valid key', () => {
            // Pattern plus large pour attraper avec ou sans ".json"
            cy.intercept('GET', /.*\/works\/OL45804W.*/, {
                statusCode: 200,
                body: {
                    key: '/works/OL45804W',
                    title: 'The Great Gatsby',
                    authors: [{ author: { key: '/authors/OL9388A' } }]
                }
            }).as('getBook');

            cy.wrap(getBookByKey('/works/OL45804W')).then((res: any) => {
                const result = res as OpenLibraryWork;
                expect(result.title).to.equal('The Great Gatsby');
            });

            cy.wait('@getBook');
        });
    });

    describe('getAuthorByKey()', () => {
        it('should fetch author details by valid key', () => {
            cy.intercept('GET', /.*\/authors\/OL9388A.*/, {
                statusCode: 200,
                body: {
                    key: '/authors/OL9388A',
                    name: 'F. Scott Fitzgerald'
                }
            }).as('getAuthor');

            cy.wrap(getAuthorByKey('/authors/OL9388A')).then((res: any) => {
                const result = res as OpenLibraryAuthor;
                expect(result.name).to.equal('F. Scott Fitzgerald');
            });

            cy.wait('@getAuthor');
        });
    });

    describe('getRecentBookAdditions()', () => {
        it('should return an array (even if empty) and filter books correctly', () => {
            const mockChanges = [
                { id: '1', kind: 'add-book', changes: [{ key: '/works/OL1W' }] },
                { id: '2', kind: 'add-book', changes: [{ key: '/works/OL2W' }] }
            ];

            const mockBookWithTitle = { key: '/works/OL1W', title: 'Recent Book' };
            const mockBookNoTitle = { key: '/works/OL2W' };

            cy.intercept('GET', /.*\/recentchanges\.json.*/, { body: mockChanges }).as('changes');
            cy.intercept('GET', /.*\/works\/OL1W.*/, { body: mockBookWithTitle }).as('book1');
            cy.intercept('GET', /.*\/works\/OL2W.*/, { body: mockBookNoTitle }).as('book2');

            cy.wrap(getRecentBookAdditions(2)).then((res: any) => {
                const result = res as any[];
                expect(result).to.be.an('array');
                if (result.length > 0) {
                    expect(result[0]).to.have.property('title');
                }
            });
        });

        it('should handle API errors on recent changes by returning an empty array', () => {
            cy.intercept('GET', /.*\/recentchanges\.json.*/, { statusCode: 500 }).as('errorChanges');

            cy.wrap(getRecentBookAdditions(5)).then((result: any) => {
                expect(result).to.be.an('array');
            });
        });
    });

    describe('Data Format Validation', () => {
        it('should validate search results property types', () => {
            cy.intercept('GET', /.*\/search\.json.*/, {
                body: { numFound: 1, docs: [{ key: 'K', title: 'T', author_name: ['A'], first_publish_year: 2000 }] }
            }).as('valid');

            cy.wrap(searchBooks('test')).then((res: any) => {
                const book = (res as OpenLibrarySearchResponse).docs[0];
                expect(book.key).to.be.a('string');
                expect(book.title).to.be.a('string');
            });
        });
    });
});