/// <reference types="cypress" />

import {
    fetchWikipediaData,
    fetchWikipediaDataForBook,
    fetchWikipediaDataForAuthor,
} from '../../../src/api/wikipedia';

interface WikipediaData {
    title: string;
    description: string;
    image?: string;
    url: string;
}

describe('Wikipedia API Integration Tests (Cypress)', () => {
    const API_BASE = 'https://en.wikipedia.org';

    describe('fetchWikipediaData()', () => {
        it('should successfully fetch Wikipedia data for valid title', () => {
            // Register intercept before calling the function
            cy.intercept('GET', `${API_BASE}/api/rest_v1/page/summary/*`, {
                statusCode: 200,
                body: {
                    type: 'standard',
                    title: 'The Great Gatsby',
                    displaytitle: 'The Great Gatsby',
                    extract: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald.',
                    thumbnail: {
                        source:
                            'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg/220px-The_Great_Gatsby_Cover_1925_Retouched.jpg',
                        width: 220,
                        height: 346,
                    },
                    originalimage: {
                        source:
                            'https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg',
                        width: 768,
                        height: 1209,
                    },
                    content_urls: {
                        desktop: {
                            page: 'https://en.wikipedia.org/wiki/The_Great_Gatsby',
                        },
                    },
                },
            }).as('wikiCall');

            cy.then(() => fetchWikipediaData('The Great Gatsby')).then((result: WikipediaData | null) => {
                expect(result).to.not.be.null;
                if (!result) return;

                expect(result.title).to.equal('The Great Gatsby');
                expect(result.description).to.include('F. Scott Fitzgerald');
                // Updated check to match actual URL returned
                expect(result.image).to.include('upload.wikimedia.org');
                expect(result.url).to.equal('https://en.wikipedia.org/wiki/The_Great_Gatsby');
            });

            cy.wait('@wikiCall');
        });

        it('should return null for empty title', () => {
            cy.then(() => fetchWikipediaData('')).then((result: WikipediaData | null) => {
                expect(result).to.be.null;
            });
        });

        it('should return null when page not found', () => {
            cy.intercept('GET', `${API_BASE}/api/rest_v1/page/summary/*`, { statusCode: 404 }).as('wiki404');

            cy.then(() => fetchWikipediaData('NonExistentBookXYZ123')).then((result: WikipediaData | null) => {
                expect(result).to.be.null;
            });

            cy.wait('@wiki404');
        });
    });

    describe('fetchWikipediaDataForBook()', () => {
        it('should try multiple search strategies for book', () => {
            cy.intercept('GET', `${API_BASE}/api/rest_v1/page/summary/*`, (req) => {
                if (req.url.includes('The_Great_Gatsby')) req.reply({ statusCode: 404 });
                else req.reply({
                    statusCode: 200,
                    body: {
                        type: 'standard',
                        title: 'The Great Gatsby',
                        extract: 'The Great Gatsby is a 1925 novel.',
                        content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/The_Great_Gatsby_(novel)' } },
                    },
                });
            }).as('wikiBook');

            cy.then(() => fetchWikipediaDataForBook('The Great Gatsby')).then((result: WikipediaData | null) => {
                expect(result).to.not.be.null;
                if (!result) return;
                expect(result.title).to.equal('The Great Gatsby');
            });

            cy.wait('@wikiBook');
        });

        it('should return null for empty book title', () => {
            cy.then(() => fetchWikipediaDataForBook('')).then((result: WikipediaData | null) => {
                expect(result).to.be.null;
            });
        });
    });

    describe('fetchWikipediaDataForAuthor()', () => {
        it('should fetch author data successfully', () => {
            cy.intercept('GET', `${API_BASE}/api/rest_v1/page/summary/*`, {
                statusCode: 200,
                body: {
                    type: 'standard',
                    title: 'F. Scott Fitzgerald',
                    extract: 'Francis Scott Key Fitzgerald was an American novelist and short story writer.',
                    thumbnail: { source: 'https://example.com/fitzgerald.jpg', width: 220, height: 280 },
                    content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/F._Scott_Fitzgerald' } },
                },
            }).as('authorCall');

            cy.then(() => fetchWikipediaDataForAuthor('F. Scott Fitzgerald')).then((result: WikipediaData | null) => {
                expect(result).to.not.be.null;
                if (!result) return;

                expect(result.title).to.equal('F. Scott Fitzgerald');
                expect(result.description).to.include('American novelist');
                expect(result.image).to.exist;
            });

            cy.wait('@authorCall');
        });

        it('should return null for empty author name', () => {
            cy.then(() => fetchWikipediaDataForAuthor('')).then((result: WikipediaData | null) => {
                expect(result).to.be.null;
            });
        });
    });
});
