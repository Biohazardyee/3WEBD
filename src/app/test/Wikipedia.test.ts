// test/api/wikipedia.test.js
import { expect } from 'chai';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  fetchWikipediaData,
  fetchWikipediaDataForBook,
  fetchWikipediaDataForAuthor,
} from '../src/api/wikipedia';

import { describe, it } from 'mocha';

describe('Wikipedia API Integration Tests', function() {
  let mock: InstanceType<typeof MockAdapter>;

  this.timeout(10000);

  beforeEach(function() {
    mock = new MockAdapter(axios);
  });

  afterEach(function() {
    mock.restore();
  });

  describe('fetchWikipediaData()', function() {
    it('should successfully fetch Wikipedia data for valid title', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'The Great Gatsby',
        displaytitle: 'The Great Gatsby',
        extract: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald.',
        thumbnail: {
          source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg/220px-The_Great_Gatsby_Cover_1925_Retouched.jpg',
          width: 220,
          height: 346
        },
        originalimage: {
          source: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg',
          width: 768,
          height: 1209
        },
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/The_Great_Gatsby',
            revisions: 'https://en.wikipedia.org/wiki/The_Great_Gatsby?action=history',
            edit: 'https://en.wikipedia.org/wiki/The_Great_Gatsby?action=edit',
            talk: 'https://en.wikipedia.org/wiki/Talk:The_Great_Gatsby'
          },
          mobile: {
            page: 'https://en.m.wikipedia.org/wiki/The_Great_Gatsby',
            revisions: 'https://en.m.wikipedia.org/wiki/Special:History/The_Great_Gatsby',
            edit: 'https://en.m.wikipedia.org/wiki/The_Great_Gatsby?action=edit',
            talk: 'https://en.m.wikipedia.org/wiki/Talk:The_Great_Gatsby'
          }
        }
      };

      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(200, mockResponse);

      const result = await fetchWikipediaData('The Great Gatsby');

      expect(result).to.be.an('object');
      expect(result).to.have.property('title', 'The Great Gatsby');
      expect(result).to.have.property('description');
      expect(result!.description).to.include('F. Scott Fitzgerald');
      expect(result).to.have.property('image');
      expect(result!.image).to.include('wikipedia.org');
      expect(result).to.have.property('url');
      expect(result!.url).to.equal('https://en.wikipedia.org/wiki/The_Great_Gatsby');
    });

    it('should return null for empty title', async function() {
      const result = await fetchWikipediaData('');
      expect(result).to.be.null;
    });

    it('should return null for whitespace-only title', async function() {
      const result = await fetchWikipediaData('   ');
      expect(result).to.be.null;
    });

    it('should return null when Wikipedia page not found (404)', async function() {
      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(404);

      const result = await fetchWikipediaData('NonExistentBookXYZ123');

      expect(result).to.be.null;
    });

    it('should handle API errors gracefully', async function() {
      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(500);

      const result = await fetchWikipediaData('Test');

      expect(result).to.be.null;
    });

    it('should handle network timeout', async function() {
      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).timeout();

      const result = await fetchWikipediaData('Test');

      expect(result).to.be.null;
    });

    it('should properly encode special characters in URL', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'Les Misérables',
        extract: 'Les Misérables is a French historical novel.',
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Les_Mis%C3%A9rables'
          }
        }
      };

      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(config => {
        expect(config.url).to.include('Les%20Mis%C3%A9rables');
        return [200, mockResponse];
      });

      const result = await fetchWikipediaData('Les Misérables');

      expect(result).to.not.be.null;
      expect(result!.title).to.equal('Les Misérables');
    });

    it('should handle response with thumbnail but no originalimage', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'Test Book',
        extract: 'A test book description',
        thumbnail: {
          source: 'https://example.com/thumb.jpg',
          width: 220,
          height: 220
        },
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Test_Book'
          }
        }
      };

      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(200, mockResponse);

      const result = await fetchWikipediaData('Test Book');

      expect(result).to.not.be.null;
      expect(result!.image).to.equal('https://example.com/thumb.jpg');
    });

    it('should handle response with originalimage but no thumbnail', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'Test Book',
        extract: 'A test book description',
        originalimage: {
          source: 'https://example.com/original.jpg',
          width: 1024,
          height: 768
        },
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Test_Book'
          }
        }
      };

      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(200, mockResponse);

      const result = await fetchWikipediaData('Test Book');

      expect(result).to.not.be.null;
      expect(result!.image).to.equal('https://example.com/original.jpg');
    });

    it('should handle response with no images', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'Test Book',
        extract: 'A test book description',
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Test_Book'
          }
        }
      };

      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(200, mockResponse);

      const result = await fetchWikipediaData('Test Book');

      expect(result).to.not.be.null;
      expect(result!.image).to.be.undefined;
    });

    it('should return null when extract is missing', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'Test Book',
        // No extract field
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Test_Book'
          }
        }
      };

      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(200, mockResponse);

      const result = await fetchWikipediaData('Test Book');

      expect(result).to.be.null;
    });
  });

  describe('fetchWikipediaDataForBook()', function() {
    it('should try multiple search strategies for book', async function() {
      // First call: exact title - 404
      mock.onGet(/The_Great_Gatsby$/).replyOnce(404);

      // Second call: with (novel) - success
      const mockResponse = {
        type: 'standard',
        title: 'The Great Gatsby',
        extract: 'The Great Gatsby is a 1925 novel.',
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/The_Great_Gatsby_(novel)'
          }
        }
      };

      mock.onGet(/The_Great_Gatsby.*novel/).replyOnce(200, mockResponse);

      const result = await fetchWikipediaDataForBook('The Great Gatsby');

      expect(result).to.not.be.null;
      expect(result!.title).to.equal('The Great Gatsby');
    });

    it('should try search with author name if provided', async function() {
      // Exact title - 404
      mock.onGet(/Gatsby/).replyOnce(404);
      // With (novel) - 404
      mock.onGet(/novel/).replyOnce(404);
      // With (book) - 404
      mock.onGet(/book/).replyOnce(404);

      // With author name - success
      const mockResponse = {
        type: 'standard',
        title: 'The Great Gatsby',
        extract: 'By F. Scott Fitzgerald',
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/The_Great_Gatsby'
          }
        }
      };

      mock.onGet(/Fitzgerald/).replyOnce(200, mockResponse);

      const result = await fetchWikipediaDataForBook('The Great Gatsby', 'F. Scott Fitzgerald');

      expect(result).to.not.be.null;
    });

    it('should return null when no strategy works', async function() {
      mock.onGet(/en.wikipedia.org/).reply(404);

      const result = await fetchWikipediaDataForBook('NonExistentBook123XYZ');

      expect(result).to.be.null;
    });

    it('should return null for empty book title', async function() {
      const result = await fetchWikipediaDataForBook('');
      expect(result).to.be.null;
    });
  });

  describe('fetchWikipediaDataForAuthor()', function() {
    it('should successfully fetch author data', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'F. Scott Fitzgerald',
        extract: 'Francis Scott Key Fitzgerald was an American novelist and short story writer.',
        thumbnail: {
          source: 'https://example.com/fitzgerald.jpg',
          width: 220,
          height: 280
        },
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/F._Scott_Fitzgerald'
          }
        }
      };

      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(200, mockResponse);

      const result = await fetchWikipediaDataForAuthor('F. Scott Fitzgerald');

      expect(result).to.not.be.null;
      expect(result!.title).to.equal('F. Scott Fitzgerald');
      expect(result!.description).to.include('American novelist');
      expect(result!.image).to.exist;
      expect(result!.url).to.include('F._Scott_Fitzgerald');
    });

    it('should return null when author not found', async function() {
      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(404);

      const result = await fetchWikipediaDataForAuthor('Unknown Author XYZ123');

      expect(result).to.be.null;
    });

    it('should return null for empty author name', async function() {
      const result = await fetchWikipediaDataForAuthor('');
      expect(result).to.be.null;
    });

    it('should handle authors with special characters', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'José Saramago',
        extract: 'José Saramago was a Portuguese writer.',
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Jos%C3%A9_Saramago'
          }
        }
      };

      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(200, mockResponse);

      const result = await fetchWikipediaDataForAuthor('José Saramago');

      expect(result).to.not.be.null;
      expect(result!.title).to.equal('José Saramago');
    });
  });

  describe('Output Format Validation', function() {
    it('should return WikipediaData with correct structure', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'Test Article',
        extract: 'Test description',
        thumbnail: {
          source: 'https://example.com/image.jpg',
          width: 220,
          height: 220
        },
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Test_Article'
          }
        }
      };

      mock.onGet(/en.wikipedia.org\/api\/rest_v1\/page\/summary/).reply(200, mockResponse);

      const result = await fetchWikipediaData('Test Article');

      // Validate structure
      expect(result).to.be.an('object');
      expect(result).to.have.all.keys('title', 'description', 'image', 'url');
      expect(result!.title).to.be.a('string');
      expect(result!.description).to.be.a('string');
      expect(result!.image).to.be.a('string');
      expect(result!.url).to.be.a('string');
    });

    it('should have valid URL format', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'Test',
        extract: 'Description',
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Test'
          }
        }
      };

      mock.onGet(/en.wikipedia.org/).reply(200, mockResponse);

      const result = await fetchWikipediaData('Test');

      expect(result!.url).to.match(/^https:\/\/en\.wikipedia\.org\/wiki\/.+$/);
    });

    it('should have valid image URL format when present', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'Test',
        extract: 'Description',
        thumbnail: {
          source: 'https://upload.wikimedia.org/wikipedia/commons/test.jpg',
          width: 220,
          height: 220
        },
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Test'
          }
        }
      };

      mock.onGet(/en.wikipedia.org/).reply(200, mockResponse);

      const result = await fetchWikipediaData('Test');

      expect(result!.image).to.match(/^https:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i);
    });
  });

  describe('Performance and Edge Cases', function() {
    it('should handle very long titles', async function() {
      const longTitle = 'A'.repeat(500);
      
      mock.onGet(/en.wikipedia.org/).reply(404);

      const result = await fetchWikipediaData(longTitle);

      expect(result).to.be.null;
    });

    it('should handle titles with multiple spaces', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'Test Book',
        extract: 'Description',
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Test_Book'
          }
        }
      };

      mock.onGet(/en.wikipedia.org/).reply(200, mockResponse);

      const result = await fetchWikipediaData('Test    Book');

      expect(result).to.not.be.null;
    });

    it('should handle concurrent requests', async function() {
      const mockResponse = {
        type: 'standard',
        title: 'Test',
        extract: 'Description',
        content_urls: {
          desktop: {
            page: 'https://en.wikipedia.org/wiki/Test'
          }
        }
      };

      mock.onGet(/en.wikipedia.org/).reply(200, mockResponse);

      const promises = [
        fetchWikipediaData('Book1'),
        fetchWikipediaData('Book2'),
        fetchWikipediaData('Book3'),
      ];

      const results = await Promise.all(promises);

      expect(results).to.have.lengthOf(3);
      results.forEach(result => {
        expect(result).to.not.be.null;
      });
    });
  });
});