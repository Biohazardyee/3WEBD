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

describe('Real API Workflow Tests', () => {
    // Timeout étendu pour les appels réels en cascade
    const workflowTimeout = { timeout: 20000 };

    describe('Enchaînement complet : De la recherche à Wikipedia', () => {
        it('devrait suivre le flux complet pour un livre célèbre', () => {
            const searchQuery = 'The Hobbit';

            // 1. Recherche initiale
            cy.wrap(searchBooks(searchQuery), workflowTimeout).then((searchRes: any) => {
                const searchData = searchRes as OpenLibrarySearchResponse;
                expect(searchData.docs).to.have.length.greaterThan(0);

                const firstBook = searchData.docs[0];
                const bookKey = firstBook.key;
                const authorName = firstBook.author_name?.[0];

                // 2. Récupération des détails du "Work" (Livre)
                return cy.wrap(getBookByKey(bookKey), workflowTimeout).then((workRes: any) => {
                    const bookDetails = workRes as OpenLibraryWork;
                    expect(bookDetails.title).to.include('The Hobbit');

                    // 3. Récupération des détails de l'Auteur
                    const authorKey = bookDetails.authors?.[0]?.author.key;

                    if (authorKey) {
                        cy.wrap(getAuthorByKey(authorKey), workflowTimeout).then((authorRes: any) => {
                            const authorDetails = authorRes as OpenLibraryAuthor;
                            expect(authorDetails.name).to.exist;


                            cy.wrap(fetchWikipediaDataForAuthor(authorDetails.name), workflowTimeout).then((wikiAuthor) => {
                                if (wikiAuthor) {
                                    expect(wikiAuthor).to.have.property('description');
                                    expect(wikiAuthor.url).to.include('wikipedia.org');
                                }
                            });
                        });
                    }
                    cy.wrap(fetchWikipediaDataForBook(bookDetails.title, authorName), workflowTimeout).then((wikiBook) => {
                        if (wikiBook) {
                            expect(wikiBook.description).to.be.a('string');
                        }
                    });
                });
            });
        });
    });

    describe('Gestion des Erreurs et Résilience', () => {
        it('devrait gérer proprement un livre sans page Wikipedia (Fallback)', () => {
            const titleInexistant = "A Book That Definitely Does Not Exist 123456789";

            cy.wrap(fetchWikipediaDataForBook(titleInexistant), workflowTimeout).then((result) => {
                // Ta fonction fetchWikipediaData retourne null en cas de 404 (AxiosError gérée)
                expect(result).to.be.null;
            });
        });

        it('devrait rester stable si une clé auteur est invalide', () => {
            // Test de la protection dans getAuthorByKey (trim/empty)
            const emptyCall = getAuthorByKey(" ").catch(err => err.message);

            cy.wrap(emptyCall).then((message) => {
                expect(message).to.equal("Invalid author key");
            });
        });
    });
});