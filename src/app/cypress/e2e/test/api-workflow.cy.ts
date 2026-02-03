/// <reference types="cypress" />

import {
    searchBooks,
    getBookByKey,
    getAuthorByKey,
} from '../../../src/api/openLibrary';
import {
    fetchWikipediaDataForBook,
    fetchWikipediaDataForAuthor,
} from '../../../src/api/wikipedia';

import {
    OpenLibrarySearchResponse,
    OpenLibraryWork,
    OpenLibraryAuthor,
} from '../../../src/types/openLibrary';
import {WikipediaData} from "../../../src/types/wikipedia";

describe('Real API Workflow Tests', () => {
    const workflowTimeout = {timeout: 20000};

    describe('From search to Wikipedia', () => {
        it('Should follow complete flux', () => {
            const searchQuery = 'The Hobbit';

            cy.wrap(searchBooks(searchQuery), workflowTimeout).then((searchRes: OpenLibrarySearchResponse) => {
                expect(searchRes.docs).to.have.length.greaterThan(0);

                const firstBook = searchRes.docs[0];
                const bookKey = firstBook.key;
                const authorName = firstBook.author_name?.[0];

                return cy.wrap(getBookByKey(bookKey), workflowTimeout).then((workRes: OpenLibraryWork) => {
                    expect(workRes.title).to.include('The Hobbit');

                    const authorKey = workRes.authors?.[0]?.author.key;

                    if (authorKey) {
                        cy.wrap(getAuthorByKey(authorKey), workflowTimeout).then((authorRes: OpenLibraryAuthor) => {
                            expect(authorRes.name).to.exist;

                            cy.wrap(fetchWikipediaDataForAuthor(authorRes.name), workflowTimeout).then((wikiAuthor: WikipediaData) => {
                                if (wikiAuthor) {
                                    expect(wikiAuthor).to.have.property('description');
                                    expect(wikiAuthor.url).to.include('wikipedia.org');
                                }
                            });
                        });
                    }
                    cy.wrap(fetchWikipediaDataForBook(workRes.title, authorName), workflowTimeout).then((wikiBook: WikipediaData) => {
                        if (wikiBook) {
                            expect(wikiBook.description).to.be.a('string');
                        }
                    });
                });
            });
        });
    });

    describe('Errors maintaining', () => {
        it('Should handle fallback books)', () => {
            const titleInexistant = "A Book That Definitely Does Not Exist 123456789";

            cy.wrap(fetchWikipediaDataForBook(titleInexistant), workflowTimeout).then((result) => {
                expect(result).to.be.null;
            });
        });

        it('Should stay stable if author key is invalid', () => {
            const emptyCall = getAuthorByKey(" ").catch(err => err.message);

            cy.wrap(emptyCall).then((message) => {
                expect(message).to.equal("Invalid author key");
            });
        });
    });
});