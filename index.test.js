const dotenv = require('dotenv');
dotenv.config();

global.Bun = {
  serve: jest.fn(() => ({
    port: 3103,
  })),
};

const { analyzeImage } = require('./src/index');

// Mock the Bun object


global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ choices: [{ message: { content: 'Image analysis result' } }] }),
  })
);

describe(analyzeImage, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if OPENAI_API_KEY is not set', async () => {
    process.env.OPENAI_API_KEY = '';
    await expect(analyzeImage('https://example.com/image.jpg')).rejects.toThrow('OPENAI_API_KEY is not set or is empty.');
  });

  it('should throw an error if COMPLETIONS_ENDPOINT is not set', async () => {
    process.env.OPENAI_API_KEY = 'YOUR API KEY';
    process.env.COMPLETIONS_ENDPOINT = '';
    await expect(analyzeImage('https://example.com/image.jpg')).rejects.toThrow('COMPLETIONS_ENDPOINT is not set or is empty.');
  });

  it('should return the image analysis result', async () => {
    process.env.OPENAI_API_KEY = 'YOUR API KEY';
    process.env.COMPLETIONS_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
    const result = await analyzeImage('https://example.com/image.jpg');
    expect(result).toBe('Image analysis result');
  });

  it('should throw an error if the API request fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );
    process.env.OPENAI_API_KEY = 'asdfghj';
    process.env.COMPLETIONS_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
    await expect(analyzeImage('https://example.com/image.jpg')).rejects.toThrow('API request failed with status: 500');
  });
});