// test/api/openLibrary.test.js
import { expect } from 'chai';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
    searchBooks,
    advancedSearch,
    getBookByKey,
    getAuthorByKey,
    getRecentBookAdditions,
} from '../src/api/openLibrary';

describe('OpenLibrary API Integration Tests', function () {
    let mock: InstanceType<typeof MockAdapter>;

    // Augmenter le timeout pour les tests d'intégration
    this.timeout(10000);

    beforeEach(function () {
        // Créer un mock adapter pour axios
        mock = new MockAdapter(axios);
    });

    afterEach(function () {
        // Restaurer axios après chaque test
        mock.restore();
    });

    describe('searchBooks()', function () {
        it('should successfully search for books with valid query', async function () {
            const mockResponse = {
                numFound: 629,
                start: 0,
                docs: [
                    {
                        key: '/works/OL45804W',
                        title: 'The Great Gatsby',
                        author_name: ['F. Scott Fitzgerald'],
                        first_publish_year: 1925,
                        cover_i: 7222246,
                        isbn: ['9780743273565'],
                        language: ['eng'],
                        subject: ['Fiction', 'Jazz Age']
                    }
                ]
            };

            mock.onGet(/openlibrary.org\/search.json/).reply(200, mockResponse);

            const result = await searchBooks('gatsby');

            expect(result).to.be.an('object');
            expect(result.numFound).to.equal(629);
            expect(result.docs).to.be.an('array');
            expect(result.docs).to.have.lengthOf(1);
            expect(result.docs[0]).to.have.property('title', 'The Great Gatsby');
            expect(result.docs[0]).to.have.property('author_name');
            expect(result.docs[0].author_name).to.include('F. Scott Fitzgerald');
        });

        it('should throw error when query is empty', async function () {
            try {
                await searchBooks('');
                expect.fail('Should have thrown an error');
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).to.equal('Search query cannot be empty');
                } else {
                    expect.fail('Error is not an instance of Error');
                }
            }
        });

        it('should handle API errors gracefully', async function () {
            mock.onGet(/openlibrary.org\/search.json/).reply(500, {
                error: 'Internal Server Error'
            });

            try {
                await searchBooks('test');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.exist;
            }
        });

        it('should return empty results when no books found', async function () {
            const mockResponse = {
                numFound: 0,
                start: 0,
                docs: []
            };

            mock.onGet(/openlibrary.org\/search.json/).reply(200, mockResponse);

            const result = await searchBooks('xyzabc123nonexistent');

            expect(result.numFound).to.equal(0);
            expect(result.docs).to.be.an('array').that.is.empty;
        });

        it('should handle pagination parameters correctly', async function () {
            const mockResponse = {
                numFound: 100,
                start: 20,
                docs: []
            };

            mock.onGet(/openlibrary.org\/search.json/).reply(config => {
                expect(config.url).to.include('page=2');
                expect(config.url).to.include('limit=20');
                return [200, mockResponse];
            });

            const result = await searchBooks('test', 2, 20);

            expect(result.start).to.equal(20);
        });
    });

    describe('advancedSearch()', function () {
        it('should perform advanced search with multiple parameters', async function () {
            const mockResponse = {
                numFound: 50,
                start: 0,
                docs: [
                    {
                        key: '/works/OL123W',
                        title: 'To Kill a Mockingbird',
                        author_name: ['Harper Lee'],
                        first_publish_year: 1960,
                        subject: ['Fiction', 'Classics']
                    }
                ]
            };

            mock.onGet(/openlibrary.org\/search.json/).reply(200, mockResponse);

            const params = {
                title: 'mockingbird',
                author: 'harper lee'
            };

            const result = await advancedSearch(params);

            expect(result).to.be.an('object');
            expect(result.numFound).to.equal(50);
            expect(result.docs).to.have.lengthOf(1);
            expect(result.docs[0].title).to.equal('To Kill a Mockingbird');
        });

        it('should handle subject filtering', async function () {
            const mockResponse = {
                numFound: 25,
                start: 0,
                docs: [
                    {
                        key: '/works/OL456W',
                        title: 'Dune',
                        subject: ['Science Fiction', 'Space Opera']
                    }
                ]
            };

            mock.onGet(/openlibrary.org\/search.json/).reply(200, mockResponse);

            const params = { subject: 'science fiction' };
            const result = await advancedSearch(params);

            expect((result.docs[0] as any)?.subject).to.include('Science Fiction');
        });

        it('should handle language filtering', async function () {
            const mockResponse = {
                numFound: 10,
                start: 0,
                docs: [
                    {
                        key: '/works/OL789W',
                        title: 'Les Misérables',
                        language: ['fre']
                    }
                ]
            };

            mock.onGet(/openlibrary.org\/search.json/).reply(200, mockResponse);

            const params = { language: 'fre' };
            const result = await advancedSearch(params);

            expect(result.docs[0].language).to.include('fre');
        });

        it('should throw error when no parameters provided', async function () {
            try {
                await advancedSearch({});
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                if (error instanceof Error) {
                    expect(error.message).to.equal('At least one search parameter needed');
                }
            }

        });

        it('should trim whitespace from parameters', async function () {
            const mockResponse = {
                numFound: 1,
                start: 0,
                docs: []
            };

            mock.onGet(/openlibrary.org\/search.json/).reply(config => {
                // Vérifier que les espaces ont été supprimés
                expect(config.url).to.not.include('%20%20');
                return [200, mockResponse];
            });

            const params = {
                title: '  gatsby  ',
                author: '  fitzgerald  '
            };

            await advancedSearch(params);
        });
    });

    describe('getBookByKey()', function () {
        it('should fetch book details by valid key', async function () {
            const mockBook = {
                key: '/works/OL45804W',
                title: 'The Great Gatsby',
                description: 'A novel about the American Dream',
                covers: [7222246],
                authors: [
                    {
                        author: { key: '/authors/OL9388A' },
                        type: { key: '/type/author_role' }
                    }
                ],
                subjects: ['Fiction', 'Jazz Age', 'American Dream'],
                created: { value: '2008-04-01T03:28:50.625462' },
                last_modified: { value: '2023-10-15T12:30:45.123456' }
            };

            mock.onGet('https://openlibrary.org/works/OL45804W.json').reply(200, mockBook);

            const result = await getBookByKey('/works/OL45804W');

            expect(result).to.be.an('object');
            expect(result.key).to.equal('/works/OL45804W');
            expect(result.title).to.equal('The Great Gatsby');
            expect(result.description).to.equal('A novel about the American Dream');
            expect(result.covers).to.be.an('array').that.includes(7222246);
            expect(result.authors).to.be.an('array').with.lengthOf(1);
            expect(result.subjects).to.include('Fiction');
        });

        it('should throw error for empty key', async function () {
            try {
                await getBookByKey('');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                if (error instanceof Error) {
                    expect(error.message).to.equal('Invalid book key');
                }
            }

        });

        it('should handle 404 for non-existent book', async function () {
            mock.onGet(/openlibrary.org\/works/).reply(404);

            try {
                await getBookByKey('/works/INVALID');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.exist;
            }
        });

        it('should handle description as object with value property', async function () {
            const mockBook = {
                key: '/works/OL123W',
                title: 'Test Book',
                description: {
                    type: '/type/text',
                    value: 'This is a description'
                }
            };

            mock.onGet(/openlibrary.org\/works/).reply(200, mockBook);

            const result = await getBookByKey('/works/OL123W');

            expect(result.description).to.be.an('object');
            expect(result.description).to.exist;

            if (typeof result.description === 'object' && result.description !== null) {
                expect(result.description.value).to.equal('This is a description');
            } else {
                expect.fail('Description is not an object');
            }
        });
    });

    describe('getAuthorByKey()', function () {
        it('should fetch author details by valid key', async function () {
            const mockAuthor = {
                key: '/authors/OL9388A',
                name: 'F. Scott Fitzgerald',
                birth_date: '24 September 1896',
                death_date: '21 December 1940',
                bio: 'American novelist and short story writer',
                photos: [6343159]
            };

            mock.onGet('https://openlibrary.org/authors/OL9388A.json').reply(200, mockAuthor);

            const result = await getAuthorByKey('/authors/OL9388A');

            expect(result).to.be.an('object');
            expect(result.key).to.equal('/authors/OL9388A');
            expect(result.name).to.equal('F. Scott Fitzgerald');
            expect(result.birth_date).to.equal('24 September 1896');
            expect(result.death_date).to.equal('21 December 1940');
            expect(result.bio).to.be.a('string');
            expect(result.photos).to.be.an('array');
        });

        it('should throw error for empty author key', async function () {
            try {
                await getAuthorByKey('');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                if (error instanceof Error) {
                    expect(error.message).to.equal('Invalid author key');
                }
            }

        });

        it('should handle bio as object with value property', async function () {
            const mockAuthor = {
                key: '/authors/OL123A',
                name: 'Test Author',
                bio: {
                    type: '/type/text',
                    value: 'Biography text'
                }
            };

            mock.onGet(/openlibrary.org\/authors/).reply(200, mockAuthor);

            const result = await getAuthorByKey('/authors/OL123A');

            expect(result.bio).to.be.an('object');
            expect(result.bio).to.exist;

            if (typeof result.bio === 'object' && result.bio !== null) {
                expect(result.bio.value).to.equal('Biography text');
            } else {
                expect.fail('Bio is not an object');
            }

        });
    });

    describe('getRecentBookAdditions()', function () {
        it('should fetch recent book additions', async function () {
            const mockChanges = [
                {
                    id: '164136703',
                    kind: 'add-book',
                    timestamp: '2026-01-27T15:23:37.261465',
                    changes: [
                        { key: '/works/OL44815921W', revision: 1 },
                        { key: '/books/OL61180106M', revision: 1 }
                    ],
                    author: { key: '/people/horncBot' }
                }
            ];

            const mockBook = {
                key: '/works/OL44815921W',
                title: 'Recent Book',
                covers: [12345],
                authors: [{ author: { key: '/authors/OL1A' } }]
            };

            mock.onGet(/openlibrary.org\/recentchanges.json/).reply(200, mockChanges);
            mock.onGet(/openlibrary.org\/works/).reply(200, mockBook);

            const result = await getRecentBookAdditions(6);

            expect(result).to.be.an('array');
            expect(result.length).to.be.at.most(6);

            if (result.length > 0) {
                expect(result[0]).to.have.property('title');
                expect(result[0]).to.have.property('covers');
            }
        });

        it('should filter out books without titles', async function () {
            const mockChanges = [
                {
                    id: '1',
                    kind: 'add-book',
                    changes: [{ key: '/works/OL1W', revision: 1 }]
                }
            ];

            const mockBookNoTitle = {
                key: '/works/OL1W',
                covers: [123]
                // No title
            };

            mock.onGet(/openlibrary.org\/recentchanges.json/).reply(200, mockChanges);
            mock.onGet(/openlibrary.org\/works/).reply(200, mockBookNoTitle);

            const result = await getRecentBookAdditions(6);

            // Should not include books without titles
            const bookWithoutTitle = result.find(b => b.key === '/works/OL1W');
            expect(bookWithoutTitle).to.be.undefined;
        });

        it('should handle API errors gracefully and return empty array', async function () {
            mock.onGet(/openlibrary.org\/recentchanges.json/).reply(500);

            const result = await getRecentBookAdditions(6);

            expect(result).to.be.an('array').that.is.empty;
        });

        it('should respect the limit parameter', async function () {
            const mockChanges = Array(20).fill(null).map((_, i) => ({
                id: `${i}`,
                kind: 'add-book',
                changes: [{ key: `/works/OL${i}W`, revision: 1 }]
            }));

            const mockBook = {
                key: '/works/OL0W',
                title: 'Test Book',
                covers: [123]
            };

            mock.onGet(/openlibrary.org\/recentchanges.json/).reply(200, mockChanges);
            mock.onGet(/openlibrary.org\/works/).reply(200, mockBook);

            const result = await getRecentBookAdditions(3);

            expect(result.length).to.be.at.most(3);
        });
    });

    describe('Data Format Validation', function () {
        it('should validate search results have correct structure', async function () {
            const mockResponse = {
                numFound: 1,
                start: 0,
                docs: [
                    {
                        key: '/works/OL123W',
                        title: 'Test Book',
                        author_name: ['Test Author'],
                        first_publish_year: 2020,
                        cover_i: 12345,
                        isbn: ['1234567890'],
                        language: ['eng'],
                        subject: ['Test'],
                        publisher: ['Test Publisher'],
                        number_of_pages_median: 200
                    }
                ]
            };

            mock.onGet(/openlibrary.org\/search.json/).reply(200, mockResponse);

            const result = await searchBooks('test');
            const book = result.docs[0];

            // Validate all expected fields exist
            expect(book).to.have.property('key').that.is.a('string');
            expect(book).to.have.property('title').that.is.a('string');
            expect(book).to.have.property('author_name').that.is.an('array');
            expect(book).to.have.property('first_publish_year').that.is.a('number');
            expect(book).to.have.property('cover_i').that.is.a('number');
            expect(book).to.have.property('isbn').that.is.an('array');
            expect(book).to.have.property('language').that.is.an('array');
            expect(book).to.have.property('subject').that.is.an('array');
        });

        it('should validate book work structure', async function () {
            const mockBook = {
                key: '/works/OL123W',
                title: 'Test Book',
                description: 'A test description',
                covers: [123, 456],
                authors: [
                    {
                        author: { key: '/authors/OL1A' },
                        type: { key: '/type/author_role' }
                    }
                ],
                subjects: ['Fiction', 'Test'],
                created: { value: '2020-01-01T00:00:00.000000' },
                last_modified: { value: '2023-01-01T00:00:00.000000' }
            };

            mock.onGet(/openlibrary.org\/works/).reply(200, mockBook);

            const result = await getBookByKey('/works/OL123W');

            // Validate structure
            expect(result.key).to.match(/^\/works\/OL\d+W$/);
            expect(result.title).to.be.a('string').with.length.above(0);
            expect(result.covers).to.be.an('array');
            expect(result.authors).to.be.an('array');
            expect(result.authors![0]).to.have.nested.property('author.key');
            expect(result.subjects).to.be.an('array');
            expect(result.created).to.have.property('value');
            expect(result.last_modified).to.have.property('value');
        });
    });
});