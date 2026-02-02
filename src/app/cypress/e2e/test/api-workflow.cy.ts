/// <reference types="cypress" />

import {
    searchBooks,
    advancedSearch,
    getBookByKey,
    getAuthorByKey,
    getRecentBookAdditions,
} from '../../../src/api/openLibrary';
import {
    fetchWikipediaDataForBook,
    fetchWikipediaDataForAuthor,
} from '../../../src/api/wikipedia';

import {
    OpenLibrarySearchResponse,
    OpenLibraryWork,
    OpenLibraryAuthor,
    OpenLibrarySearchDoc,
    Book
} from '../../../src/types/openLibrary';

describe('API Integration Workflow Tests (Cypress)', () => {

    describe('Complete Book Detail Workflow', () => {
        it('should fetch book, author, and Wikipedia data in sequence', () => {
            // 1. Mock Search
            cy.intercept('GET', /.*\/search\.json.*/, {
                statusCode: 200,
                body: {
                    numFound: 1,
                    docs: [{
                        key: '/works/OL45804W',
                        title: 'The Great Gatsby',
                        author_name: ['F. Scott Fitzgerald'],
                        first_publish_year: 1925
                    }]
                }
            }).as('searchApi');

            // 2. Mock Book Details
            cy.intercept('GET', /.*\/works\/OL45804W.*/, {
                statusCode: 200,
                body: {
                    key: '/works/OL45804W',
                    title: 'The Great Gatsby',
                    authors: [{author: {key: '/authors/OL9388A'}}]
                }
            }).as('bookApi');

            // 3. Mock Author Details
            cy.intercept('GET', /.*\/authors\/OL9388A.*/, {
                statusCode: 200,
                body: {
                    key: '/authors/OL9388A',
                    name: 'F. Scott Fitzgerald',
                    bio: 'American novelist'
                }
            }).as('authorApi');

            cy.wrap(searchBooks('gatsby')).then((searchResult: any) => {
                const results = searchResult as OpenLibrarySearchResponse;
                expect(results.docs).to.have.lengthOf(1);
                const bookKey = results.docs[0].key;

                return cy.wrap(getBookByKey(bookKey));
            }).then((bookData: any) => {
                const book = bookData as OpenLibraryWork;
                expect(book.title).to.equal('The Great Gatsby');

                const authorKey = book.authors![0].author.key;

                cy.wrap(getAuthorByKey(authorKey)).then((authorData: any) => {
                    const author = authorData as OpenLibraryAuthor;
                    expect(author.name).to.equal('F. Scott Fitzgerald');

                    // Wikipedia calls
                    cy.wrap(fetchWikipediaDataForBook(book.title, author.name)).then((wikiBook: any) => {
                        if (wikiBook && wikiBook.description) {
                            expect(wikiBook.description).to.include('F. Scott Fitzgerald');
                        }
                    });
                });
            });
        });
    });

    describe('Error Recovery Workflow', () => {
        it('should gracefully handle partial failures (500 and 404)', () => {
            cy.intercept('GET', /.*\/works\/.*/, {
                statusCode: 200,
                body: {title: 'Test Book', authors: [{author: {key: '/authors/OL456A'}}]}
            });

            cy.intercept('GET', /.*\/authors\/.*/, {statusCode: 500});
            cy.intercept('GET', /.*wikipedia\.org.*/, {statusCode: 404});

            cy.wrap(getBookByKey('/works/OL123W')).then((book: any) => {
                const b = book as OpenLibraryWork;
                expect(b.title).to.equal('Test Book');
            });

            const authorPromise = getAuthorByKey('/authors/OL456A').catch(err => ({
                error: true,
                status: err.response?.status
            }));
            cy.wrap(authorPromise).then((result: any) => {
                expect(result.error).to.be.true;
            });

            // On catch l'erreur 404 de Wikipedia
            const wikiPromise = fetchWikipediaDataForBook('Test Book').catch(() => null);
            cy.wrap(wikiPromise).then((wikiData: any) => {
                expect(wikiData).to.be.null;
            });
        });

        it('should handle rate limiting (429)', () => {
            cy.intercept('GET', /.*openlibrary\.org.*/, {
                statusCode: 429,
                body: {error: 'Rate limit exceeded'},
                headers: {'retry-after': '10'}
            }).as('rateLimit');


            cy.wrap(searchBooks('test').catch(err => {
                console.log('Caught error:', err);
                return err;
            })).then((err: any) => {
                if (err.response) {
                    expect(err.response.status).to.equal(429);
                } else if (err.status) {
                    expect(err.status).to.equal(429);
                } else {
                    expect(err.toString()).to.include('429');
                }
            });
        });
    });

    describe('getRecentBookAdditions()', () => {
        it('should return an array and handle empty results gracefully', () => {
            const mockChanges = [
                {id: '1', kind: 'add-book', changes: [{key: '/works/OL1W'}]}
            ];
            const mockBook = {key: '/works/OL1W', title: 'Recent Book'};

            cy.intercept('GET', /.*\/recentchanges\.json.*/, {body: mockChanges});
            cy.intercept('GET', /.*\/works\/OL1W.*/, {body: mockBook});

            cy.wrap(getRecentBookAdditions(1)).then((res: any) => {
                const result = res as any[];
                expect(result).to.be.an('array');
            });
        });
    });

    describe('Data Transformation & Pagination', () => {
        it('should transform OpenLibrary data to internal Book format', () => {
            const doc: Partial<OpenLibrarySearchDoc> = {
                key: '/works/OL123W',
                title: 'Test Book',
                author_name: ['Test Author'],
                first_publish_year: 2020
            };

            const transformToBook = (d: Partial<OpenLibrarySearchDoc>): Partial<Book> => ({
                id: d.key,
                title: d.title,
                author: d.author_name?.[0] || 'Unknown Author',
                year: d.first_publish_year || 0,
            });

            const book = transformToBook(doc);
            expect(book.id).to.equal('/works/OL123W');
            expect(book.title).to.equal('Test Book');
        });

        it('should correctly handle pagination parameters', () => {
            cy.intercept('GET', /.*page=2.*/, {
                statusCode: 200,
                body: {start: 20, docs: [{key: '2'}]}
            }).as('page2');

            cy.wrap(searchBooks('test', 2, 20)).then((res: any) => {
                const response = res as OpenLibrarySearchResponse;
                expect(response.start).to.equal(20);
            });
        });
    });
});