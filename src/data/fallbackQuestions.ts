import { Question } from '../services/geminiService';

export const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  'Genesis': [
    {
      id: 'gen-fb-1',
      verse: 'Genesis 1:1',
      text: 'In the beginning, God created the heavens and the earth.',
      question: 'What did God create in the beginning?',
      options: ['The heavens and the earth', 'The sun and the moon', 'Man and woman', 'The garden of Eden'],
      answer: 'The heavens and the earth',
      explanation: 'Genesis 1:1 clearly states that in the beginning, God created the heavens and the earth.'
    },
    {
      id: 'gen-fb-2',
      verse: 'Genesis 2:7',
      text: 'then the LORD God formed the man of dust from the ground and breathed into his nostrils the breath of life, and the man became a living creature.',
      question: 'From what did God form man?',
      options: ['Dust from the ground', 'Water from the sea', 'Light from the sun', 'Clay from the river'],
      answer: 'Dust from the ground',
      explanation: 'Genesis 2:7 describes man being formed from the dust of the ground.'
    },
    {
      id: 'gen-fb-3',
      verse: 'Genesis 6:14',
      text: 'Make yourself an ark of gopher wood. Make rooms in the ark, and cover it inside and out with pitch.',
      question: 'What kind of wood was Noah told to use for the ark?',
      options: ['Gopher wood', 'Cedar wood', 'Oak wood', 'Olive wood'],
      answer: 'Gopher wood',
      explanation: 'God explicitly commanded Noah to use gopher wood for the ark.'
    },
    {
      id: 'gen-fb-4',
      verse: 'Genesis 9:13',
      text: 'I have set my bow in the cloud, and it shall be a sign of the covenant between me and the earth.',
      question: 'What was the sign of God\'s covenant with Noah?',
      options: ['A rainbow', 'A burning bush', 'A pillar of salt', 'A dove'],
      answer: 'A rainbow',
      explanation: 'The rainbow (bow in the cloud) was the sign of God\'s covenant never to destroy the earth with a flood again.'
    },
    {
      id: 'gen-fb-5',
      verse: 'Genesis 12:1',
      text: 'Now the LORD said to Abram, "Go from your country and your kindred and your father\'s house to the land that I will show you."',
      question: 'Who did God tell to leave his country and go to a new land?',
      options: ['Abram', 'Lot', 'Isaac', 'Jacob'],
      answer: 'Abram',
      explanation: 'God called Abram to leave Haran and go to the land of Canaan.'
    }
  ],
  'Exodus': [
    {
      id: 'exo-fb-1',
      verse: 'Exodus 3:2',
      text: 'And the angel of the LORD appeared to him in a flame of fire out of the midst of a bush.',
      question: 'In what form did the angel of the Lord appear to Moses?',
      options: ['A burning bush', 'A pillar of cloud', 'A gentle breeze', 'A bright star'],
      answer: 'A burning bush',
      explanation: 'Moses encountered God through the burning bush that was not consumed.'
    },
    {
      id: 'exo-fb-2',
      verse: 'Exodus 14:21',
      text: 'Then Moses stretched out his hand over the sea, and the LORD drove the sea back by a strong east wind all night and made the sea dry land, and the waters were divided.',
      question: 'What did God use to drive back the Red Sea?',
      options: ['A strong east wind', 'A heavy rain', 'An earthquake', 'A bolt of lightning'],
      answer: 'A strong east wind',
      explanation: 'Exodus 14:21 states that the Lord drove the sea back by a strong east wind.'
    },
    {
      id: 'exo-fb-3',
      verse: 'Exodus 16:15',
      text: 'When the people of Israel saw it, they said to one another, "What is it?" For they did not know what it was. And Moses said to them, "It is the bread that the LORD has given you to eat."',
      question: 'What was the bread from heaven called?',
      options: ['Manna', 'Leaven', 'Quail', 'Honey'],
      answer: 'Manna',
      explanation: 'The bread from heaven was called Manna, which means "What is it?".'
    },
    {
      id: 'exo-fb-4',
      verse: 'Exodus 20:3',
      text: 'You shall have no other gods before me.',
      question: 'What is the first of the Ten Commandments?',
      options: ['No other gods before me', 'Do not steal', 'Honor your father and mother', 'Do not murder'],
      answer: 'No other gods before me',
      explanation: 'The first commandment is to have no other gods before the Lord.'
    },
    {
      id: 'exo-fb-5',
      verse: 'Exodus 32:4',
      text: 'And he received the gold from their hand and fashioned it with a graving tool and made a golden calf.',
      question: 'What idol did Aaron make for the Israelites while Moses was on the mountain?',
      options: ['A golden calf', 'A bronze serpent', 'A stone altar', 'A wooden pole'],
      answer: 'A golden calf',
      explanation: 'Aaron fashioned a golden calf from the gold of the Israelites.'
    }
  ],
  'Matthew': [
    {
      id: 'mat-fb-1',
      verse: 'Matthew 1:21',
      text: 'She will bear a son, and you shall call his name Jesus, for he will save his people from their sins.',
      question: 'What does the name Jesus mean in this context?',
      options: ['He will save his people', 'God is with us', 'King of Kings', 'Prince of Peace'],
      answer: 'He will save his people',
      explanation: 'The name Jesus is derived from the Hebrew name Yeshua, which means "Yahweh saves".'
    },
    {
      id: 'mat-fb-2',
      verse: 'Matthew 3:13',
      text: 'Then Jesus came from Galilee to the Jordan to John, to be baptized by him.',
      question: 'Who baptized Jesus in the Jordan River?',
      options: ['John the Baptist', 'Peter', 'James', 'Andrew'],
      answer: 'John the Baptist',
      explanation: 'John the Baptist baptized Jesus in the Jordan River.'
    },
    {
      id: 'mat-fb-3',
      verse: 'Matthew 4:19',
      text: 'And he said to them, "Follow me, and I will make you fishers of men."',
      question: 'What did Jesus say he would make his disciples?',
      options: ['Fishers of men', 'Shepherds of the flock', 'Builders of the kingdom', 'Light of the world'],
      answer: 'Fishers of men',
      explanation: 'Jesus called his disciples to become "fishers of men".'
    },
    {
      id: 'mat-fb-4',
      verse: 'Matthew 5:3',
      text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.',
      question: 'According to the Beatitudes, who is blessed because theirs is the kingdom of heaven?',
      options: ['The poor in spirit', 'The meek', 'The merciful', 'The peacemakers'],
      answer: 'The poor in spirit',
      explanation: 'The first Beatitude states that the poor in spirit are blessed.'
    },
    {
      id: 'mat-fb-5',
      verse: 'Matthew 14:19',
      text: 'Then he ordered the crowds to sit down on the grass, and taking the five loaves and the two fish, he looked up to heaven and said a blessing.',
      question: 'How many loaves and fish did Jesus use to feed the five thousand?',
      options: ['5 loaves and 2 fish', '7 loaves and 3 fish', '12 loaves and 5 fish', '3 loaves and 1 fish'],
      answer: '5 loaves and 2 fish',
      explanation: 'Jesus fed the five thousand with five loaves and two fish.'
    }
  ],
  'Psalms': [
    {
      id: 'psa-fb-1',
      verse: 'Psalm 23:1',
      text: 'The LORD is my shepherd; I shall not want.',
      question: 'Who is described as the shepherd in Psalm 23?',
      options: ['The LORD', 'David', 'Moses', 'Abraham'],
      answer: 'The LORD',
      explanation: 'Psalm 23 begins with "The LORD is my shepherd".'
    },
    {
      id: 'psa-fb-2',
      verse: 'Psalm 119:105',
      text: 'Your word is a lamp to my feet and a light to my path.',
      question: 'What is described as a lamp to the feet and a light to the path?',
      options: ['God\'s word', 'The sun', 'Wisdom', 'Faith'],
      answer: 'God\'s word',
      explanation: 'Psalm 119:105 describes God\'s word as a lamp and a light.'
    },
    {
      id: 'psa-fb-3',
      verse: 'Psalm 100:1',
      text: 'Make a joyful noise to the LORD, all the earth!',
      question: 'What are we told to make to the LORD in Psalm 100?',
      options: ['A joyful noise', 'A silent prayer', 'A golden offering', 'A new song'],
      answer: 'A joyful noise',
      explanation: 'Psalm 100 calls all the earth to make a joyful noise to the Lord.'
    },
    {
      id: 'psa-fb-4',
      verse: 'Psalm 1:1',
      text: 'Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners, nor sits in the seat of scoffers;',
      question: 'Who is described as blessed in the beginning of Psalm 1?',
      options: ['The man who avoids the wicked', 'The man who is wealthy', 'The man who is powerful', 'The man who is famous'],
      answer: 'The man who avoids the wicked',
      explanation: 'Psalm 1:1 describes the blessed man as one who avoids the ways of the wicked.'
    },
    {
      id: 'psa-fb-5',
      verse: 'Psalm 46:1',
      text: 'God is our refuge and strength, a very present help in trouble.',
      question: 'What is God described as in Psalm 46:1?',
      options: ['Refuge and strength', 'Judge and jury', 'Creator and destroyer', 'King and master'],
      answer: 'Refuge and strength',
      explanation: 'Psalm 46:1 states that God is our refuge and strength.'
    }
  ]
};
