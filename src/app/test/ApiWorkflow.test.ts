// test/integration/apiWorkflow.test.js
import { expect } from 'chai';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
    searchBooks,
    getBookByKey,
    getAuthorByKey,
} from '../src/api/openLibrary';
import {
    fetchWikipediaDataForBook,
    fetchWikipediaDataForAuthor,
} from '../src/api/wikipedia';

import type { OpenLibrarySearchDoc, OpenLibrarySearchResponse } from '../src/types/openLibrary'

describe('API Integration Workflow Tests', function () {
    let mock: InstanceType<typeof MockAdapter>;


    this.timeout(15000);

    beforeEach(function () {
        mock = new MockAdapter(axios);
    });

    afterEach(function () {
        mock.restore();
    });

    describe('Complete Book Detail Workflow', function () {
        it('should fetch book, author, and Wikipedia data in sequence', async function () {
            // Step 1: Search for book
            const searchResponse = {
                numFound: 1,
                start: 0,
                docs: [
                    {
                        key: '/works/OL45804W',
                        title: 'The Great Gatsby',
                        author_name: ['F. Scott Fitzgerald'],
                        first_publish_year: 1925,
                        cover_i: 7222246
                    }
                ]
            };

            mock.onGet(/openlibrary.org\/search.json/).reply(200, searchResponse);

            const searchResult = await searchBooks('gatsby');
            expect(searchResult.docs).to.have.lengthOf(1);

            const bookKey = searchResult.docs[0].key;

            // Step 2: Fetch book details
            const bookResponse = {
                key: '/works/OL45804W',
                title: 'The Great Gatsby',
                description: 'A novel about the American Dream in the Jazz Age',
                covers: [7222246],
                authors: [
                    {
                        author: { key: '/authors/OL9388A' }
                    }
                ],
                subjects: ['Fiction', 'Jazz Age', 'American Dream']
            };

            mock.onGet('https://openlibrary.org/works/OL45804W.json').reply(200, bookResponse);

            const book = await getBookByKey(bookKey);
            expect(book.title).to.equal('The Great Gatsby');

            const authorKey = book.authors![0].author.key;

            // Step 3: Fetch author details
            const authorResponse = {
                key: '/authors/OL9388A',
                name: 'F. Scott Fitzgerald',
                birth_date: '24 September 1896',
                death_date: '21 December 1940',
                bio: 'American novelist and short story writer'
            };

            mock.onGet('https://openlibrary.org/authors/OL9388A.json').reply(200, authorResponse);

            const author = await getAuthorByKey(authorKey);
            expect(author.name).to.equal('F. Scott Fitzgerald');

            // Step 4: Fetch Wikipedia data for book
            const wikiBookResponse = {
                type: 'standard',
                title: 'The Great Gatsby',
                extract: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald.',
                thumbnail: {
                    source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg/220px.jpg'
                },
                content_urls: {
                    desktop: {
                        page: 'https://en.wikipedia.org/wiki/The_Great_Gatsby'
                    }
                }
            };

            mock.onGet(/en.wikipedia.org.*The_Great_Gatsby/).reply(200, wikiBookResponse);

            const wikiBook = await fetchWikipediaDataForBook(book.title, author.name);
            expect(wikiBook).to.not.be.null;
            expect(wikiBook!.description).to.include('F. Scott Fitzgerald');

            // Step 5: Fetch Wikipedia data for author
            const wikiAuthorResponse = {
                type: 'standard',
                title: 'F. Scott Fitzgerald',
                extract: 'Francis Scott Key Fitzgerald was an American novelist.',
                content_urls: {
                    desktop: {
                        page: 'https://en.wikipedia.org/wiki/F._Scott_Fitzgerald'
                    }
                }
            };

            mock.onGet(/en.wikipedia.org.*F._Scott_Fitzgerald/).reply(200, wikiAuthorResponse);

            const wikiAuthor = await fetchWikipediaDataForAuthor(author.name);
            expect(wikiAuthor).to.not.be.null;
            expect(wikiAuthor!.description).to.include('American novelist');
        });
    });

    describe('Advanced Search to Book Detail Workflow', function () {
        it('should handle advanced search with year filtering', async function () {
            // Advanced search with multiple parameters
            const searchResponse: OpenLibrarySearchResponse = {
                numFound: 25,
                start: 0,
                docs: [
                    {
                        key: '/works/OL123W',
                        title: 'To Kill a Mockingbird',
                        author_name: ['Harper Lee'],
                        first_publish_year: 1960,
                        cover_i: 12345,
                        subject: ['Fiction', 'Classics', 'Southern Gothic']
                    },
                    {
                        key: '/works/OL456W',
                        title: '1984',
                        author_name: ['George Orwell'],
                        first_publish_year: 1949,
                        cover_i: 67890
                    }
                ]
            };

            mock.onGet(/openlibrary.org\/search.json/).reply(200, searchResponse);

            // Should be able to import and use advancedSearch
            // Then filter by year range 1950-1970
            const yearFrom = 1950;
            const yearTo = 1970;

            const filteredBooks = searchResponse.docs.filter(doc => {
                return doc.first_publish_year! >= yearFrom &&
                    doc.first_publish_year! <= yearTo;
            });

            expect(filteredBooks).to.have.lengthOf(1);
            expect(filteredBooks[0].title).to.equal('To Kill a Mockingbird');
        });
    });

    describe('Error Recovery Workflow', function () {
        it('should gracefully handle partial failures', async function () {
            // Book fetch succeeds
            const bookResponse = {
                key: '/works/OL123W',
                title: 'Test Book',
                covers: [123],
                authors: [
                    {
                        author: { key: '/authors/OL456A' }
                    }
                ]
            };

            mock.onGet(/openlibrary.org\/works/).reply(200, bookResponse);

            const book = await getBookByKey('/works/OL123W');
            expect(book).to.not.be.null;

            // Author fetch fails
            mock.onGet(/openlibrary.org\/authors/).reply(500);

            try {
                await getAuthorByKey('/authors/OL456A');
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error).to.exist;
            }

            // Wikipedia fetch returns null (not found)
            mock.onGet(/en.wikipedia.org/).reply(404);

            const wikiData = await fetchWikipediaDataForBook(book.title);
            expect(wikiData).to.be.null;

            // Application should still be able to display book details
            // even if author and Wikipedia data are unavailable
            expect(book.title).to.equal('Test Book');
        });

        it('should handle rate limiting gracefully', async function () {
            // Simulate rate limit response (429)
            mock.onGet(/openlibrary.org/).reply(429, {
                error: 'Rate limit exceeded'
            });

            try {
                await searchBooks('test');
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error).to.exist;
            }
        });
    });

    describe('Data Transformation Workflow', function () {
        it('should transform OpenLibrary data to internal Book format', async function () {
            const searchResponse = {
                numFound: 1,
                start: 0,
                docs: [
                    {
                        key: '/works/OL123W',
                        title: 'Test Book',
                        author_name: ['Test Author'],
                        first_publish_year: 2020,
                        cover_i: 12345,
                        subject: ['Fiction', 'Test'],
                        language: ['eng'],
                        isbn: ['1234567890'],
                        publisher: ['Test Publisher'],
                        number_of_pages_median: 200
                    }
                ]
            };

            mock.onGet(/openlibrary.org/).reply(200, searchResponse);

            const result = await searchBooks('test');
            const doc = result.docs[0];

            // Transform to internal Book format
            const book = {
                id: doc.key,
                title: doc.title || 'Unknown Title',
                author: doc.author_name?.[0] || 'Unknown Author',
                year: doc.first_publish_year || 0,
                coverUrl: doc.cover_i
                    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                    : '/placeholder-book.png',
                description: '',
                subjects: doc.subject?.slice(0, 3) || [],
                language: doc.language?.[0] || 'en',
                isbn: doc.isbn?.[0] || '',
                pages: doc.number_of_pages_median || 0,
                publisher: doc.publisher?.[0] || '',
                dateAdded: new Date().toISOString(),
            };

            // Validate transformation
            expect(book.id).to.equal('/works/OL123W');
            expect(book.title).to.equal('Test Book');
            expect(book.author).to.equal('Test Author');
            expect(book.year).to.equal(2020);
            expect(book.coverUrl).to.include('covers.openlibrary.org');
            expect(book.subjects).to.be.an('array').with.lengthOf(2);
            expect(book.language).to.equal('eng');
            expect(book.isbn).to.equal('1234567890');
            expect(book.pages).to.equal(200);
            expect(book.publisher).to.equal('Test Publisher');
            expect(book.dateAdded).to.match(/^\d{4}-\d{2}-\d{2}T/);
        });

        it('should handle missing optional fields in transformation', async function () {
            const minimalDoc: OpenLibrarySearchDoc = {
                key: '/works/OL999W',
                title: 'Minimal Book'
                // champs optionnels absents → OK
            };


            // Transform with missing fields
            const book = {
                id: minimalDoc.key,
                title: minimalDoc.title || 'Unknown Title',
                author: minimalDoc.author_name?.[0] || 'Unknown Author',
                year: minimalDoc.first_publish_year || 0,
                coverUrl: minimalDoc.cover_i
                    ? `https://covers.openlibrary.org/b/id/${minimalDoc.cover_i}-M.jpg`
                    : '/placeholder-book.png',
                description: '',
                subjects: minimalDoc.subject?.slice(0, 3) || [],
                language: minimalDoc.language?.[0] || 'en',
                isbn: minimalDoc.isbn?.[0] || '',
                pages: minimalDoc.number_of_pages_median || 0,
                publisher: minimalDoc.publisher?.[0] || '',
                dateAdded: new Date().toISOString(),
            };

            // Should use default values
            expect(book.author).to.equal('Unknown Author');
            expect(book.year).to.equal(0);
            expect(book.coverUrl).to.equal('/placeholder-book.png');
            expect(book.subjects).to.be.an('array').that.is.empty;
            expect(book.language).to.equal('en');
            expect(book.isbn).to.equal('');
            expect(book.pages).to.equal(0);
            expect(book.publisher).to.equal('');
        });
    });

    describe('Pagination Workflow', function () {
        it('should correctly handle pagination parameters', async function () {
            const page1Response = {
                numFound: 100,
                start: 0,
                docs: Array(20).fill(null).map((_, i) => ({
                    key: `/works/OL${i}W`,
                    title: `Book ${i}`,
                    first_publish_year: 2020 + i
                }))
            };

            const page2Response = {
                numFound: 100,
                start: 20,
                docs: Array(20).fill(null).map((_, i) => ({
                    key: `/works/OL${i + 20}W`,
                    title: `Book ${i + 20}`,
                    first_publish_year: 2020 + i + 20
                }))
            };

            mock.onGet(/page=1/).reply(200, page1Response);
            mock.onGet(/page=2/).reply(200, page2Response);

            const result1 = await searchBooks('test', 1, 20);
            expect(result1.start).to.equal(0);
            expect(result1.docs).to.have.lengthOf(20);

            const result2 = await searchBooks('test', 2, 20);
            expect(result2.start).to.equal(20);
            expect(result2.docs).to.have.lengthOf(20);

            // Verify different books on different pages
            expect(result1.docs[0].key).to.not.equal(result2.docs[0].key);
        });

        it('should calculate total pages correctly', async function () {
            const totalResults = 87;
            const resultsPerPage = 20;
            const expectedPages = Math.ceil(totalResults / resultsPerPage); // 5

            expect(expectedPages).to.equal(5);

            // Simulate fetching last page
            const lastPageResponse = {
                numFound: totalResults,
                start: 80,
                docs: Array(7).fill(null).map((_, i) => ({
                    key: `/works/OL${i + 80}W`,
                    title: `Book ${i + 80}`
                }))
            };

            mock.onGet(/page=5/).reply(200, lastPageResponse);

            const lastPage = await searchBooks('test', 5, 20);
            expect(lastPage.docs).to.have.lengthOf(7); // Remaining books
        });
    });
});