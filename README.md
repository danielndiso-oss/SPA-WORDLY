## WORDLY SINGLE PAGE APPLICATION

Wordly is a responsive and a simple single page application that lets users to look up for English words and view their definitions, parts of speech, phonetics, synonyms, and their audio pronunciation. Below you will get to know more on the SPA , how it is built, and how to use it.

## FEATURES PROVIDED

- Word Search - Search for any English word through the search bar.
- Word Meanings - Display the word's meaning alongside its part of speech.
- Pronunciation - Shows the phonetic spellings of the searched word when it is available.
- Audio Playback - When the audio pronunciation is available from the API, the user can get to play by clicking the play button.
- Word's Synonyms - Displays all the synonyms found for the searched word.
- Error Handling - Gives you a user-polite message for an empty input, when the the API is not reached and the words that has no results.
- A Good Layout - A good layout for the SPA where the CSS played a critical role on that.


## Architecture for the application

HTML - The structure and the Markup of the application.
Javascript - API fetching, data parsing, DOM manipulation, and event handling.
CSS - For the Styling of the page.
Tailwind CSS - Provision for the classes used for the responsive styling and layout.
The API url - Dictionary api for the source of the data.


## The project structure

wordly-app-search-feature/
├── index.html                              # Entry point where the app structure is created
├── style.css                               # Design and Layout rules for the structure
├── script.js                               # Logic for fetching data and displaying results
└── kourosh-qaffari-Rrhhzityizg-unsplash.jpg # The Background image for the SPA


## Challenges encountered

- Unreliable API responses - the primary API sometimes failed to return the results, which led me to the additional of the freeDictionary API as the fallback.
- Inconsistent data - Not every word has the audio, phonetics, or the synonyms.
- Error handling - Network failures covering empty inputs, and words with no results.
- The responsive layout - keeping the design clean and readable across different sizes.


## Procedure to use the (SPA)

A. git clone the repository onto your local machine.

B. Open index.html on your browser 

C. Type an English word into the search bar.

D. Read the meaning of the word and its part of speech shown.

E. Check out the phonetic spelling, if available.

F. Click on the play button if the audio for searched word is available.

G. Scroll to the synonyms section to see the related words.

H. Incase of an error message, check the spelling of the word you inputed or get to confirm your internet connection.















