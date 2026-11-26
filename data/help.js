// The help: a short guide to every feature, as topics of plain blocks (see js/guideview.js).
// The topics have no examples. In any text, *x* shows as bold.

export const HELP = {
  intro: 'Learn the most common Turkish words and patterns, a little every day. Tap a topic to see how a part of the app works.',
  sections: [
    {
      id: 'practice',
      icon: '🎯',
      title: 'Practice',
      sub: 'Flashcards that come back at the right time',
      blocks: [
        { p: 'Switch to *Practice* at the top. You get one card at a time. Say the answer to yourself, then tap *Show answer*.' },
        { p: 'Tell the app how it went: *Forgot*, *Hard* or *Easy*. Each button shows when the card will come back. Forgotten cards return soon, easy ones much later.' },
        { list: ['Tapped the wrong one? *Undo* takes the answer back.', 'The button at the top switches direction: *EN → TR* (say it in Turkish) or *TR → EN* (understand it).', 'A word or pattern you just learned one way comes up as new the other way only after a week, so it is not fresh in your memory.'] },
        { tip: 'You get 15 new cards a day in each direction. When they are done, *More new cards* gives you 15 more.' },
      ],
    },
    {
      id: 'browse',
      icon: '🧱',
      title: 'Browse',
      sub: 'Words and patterns, by topic',
      blocks: [
        { p: 'In *Browse*, the *Words* and *Patterns* tabs show every block. The buttons under the search field filter by word type (*Words*) or pattern group (*Patterns*). The menu sorts the list, for example *By topic*.' },
        { p: 'Tap a block to select it. Tap it again to unselect it. *Clear* removes all your selections in this tab.' },
        { p: 'Your selected blocks are used when the app writes example sentences, so pick the words you are learning now.' },
      ],
    },
    {
      id: 'windows',
      icon: 'ℹ️',
      title: 'The ⓘ window',
      sub: 'Examples, and fixing an answer',
      blocks: [
        { p: 'Tap the ⓘ on a block to open its window. It shows the word or pattern with example sentences. Tap the speaker to hear one.' },
        { p: 'Sentences under *From your selection* are built from the blocks you selected.' },
        { p: 'The *Practice* section in this window shows how well you know the word, in each direction. Tap *New*, *Forgot*, *Hard* or *Easy* to correct it, for example after a wrong tap.' },
      ],
    },
    {
      id: 'search',
      icon: '🔍',
      title: 'Search and scan',
      sub: 'Find a word, or read a photo',
      blocks: [
        { p: 'In *Browse*, type in the search field, in English or Turkish. The list shows only what matches.' },
        { p: 'The camera button next to the search field scans a photo of Turkish text, for example a page of a book. You can then tap any sentence to have it explained.' },
        { tip: 'Scanning needs a free Gemini key. You add it in *Settings*; see the topic about AI.' },
      ],
    },
    {
      id: 'translate',
      icon: '💬',
      title: 'Translate',
      sub: 'The chat bubble at the top',
      blocks: [
        { p: 'The chat bubble opens a translator. Type or paste text and it is translated between English and Turkish as you type.' },
        { p: 'Use the swap button to turn the direction around. The bubble is also in the title row of every word, pattern and scan window, so you can translate while you read.' },
      ],
    },
    {
      id: 'book',
      icon: '📖',
      title: 'The grammar book',
      sub: 'The open book at the top',
      blocks: [
        { p: 'The open book at the top opens a short grammar book. It starts with the letters and their sounds, then covers one idea at a time.' },
        { p: 'The book is grouped into chapters. *Next* at the bottom of a page goes on to the next one.' },
        { p: 'Every Turkish sentence has a speaker button. The book button is also in the title row of every word, pattern and scan window.' },
        { tip: 'Open it when you are curious about why a word looks the way it does. You never have to read it in order.' },
      ],
    },
    {
      id: 'ai',
      icon: '✨',
      title: 'More examples with AI',
      sub: 'Optional, free, set up in Settings',
      blocks: [
        { p: 'The built-in examples always work, offline too. If you set up a free AI in *Settings*, the ⓘ window also gets a *More examples* button.' },
        { p: 'In *Settings* choose a provider and paste your key. Press *Test* to check that it works. The key stays on this phone.' },
        { tip: 'Google Gemini is the recommended one, and it is also the one the photo scan uses.' },
      ],
    },
    {
      id: 'settings',
      icon: '⚙️',
      title: 'Settings',
      sub: 'The gear at the top',
      blocks: [
        { list: [
          '*Show Turkish on blocks*: turn it off to test yourself. Read the English, say the Turkish, then tap ⓘ to check.',
          'Under *Pronunciation* you can test the Turkish voice. No sound? Silent mode mutes it on iPhone.',
          '*Copy backup* copies your progress as text. Paste it into Notes now and then, and use *Restore…* if you ever need it back.',
        ] },
      ],
    },
    {
      id: 'routine',
      icon: '🗓️',
      title: 'A good routine',
      sub: 'A little every day is enough',
      blocks: [
        { p: 'Practise for 5 to 10 minutes a day. Short and regular beats long and rare.' },
        { p: 'When something comes up in real life, find it in *Browse* and look at its topic.' },
        { tip: 'Open the grammar book when you feel curious. There is no hurry.' },
      ],
    },
  ],
};
