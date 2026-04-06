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
  ],
  'John': [
    {
      id: 'joh-fb-1',
      verse: 'John 1:1',
      text: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
      question: 'Who was with God in the beginning?',
      options: ['The Word', 'The angels', 'The world', 'The prophets'],
      answer: 'The Word',
      explanation: 'John 1:1 identifies the Word as being with God in the beginning.'
    },
    {
      id: 'joh-fb-2',
      verse: 'John 3:16',
      text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
      question: 'What did God give because he loved the world?',
      options: ['His only Son', 'The Ten Commandments', 'The Promised Land', 'The Holy Spirit'],
      answer: 'His only Son',
      explanation: 'John 3:16 is one of the most famous verses, stating God gave his only Son.'
    },
    {
      id: 'joh-fb-3',
      verse: 'John 11:35',
      text: 'Jesus wept.',
      question: 'What is the shortest verse in the Bible?',
      options: ['Jesus wept', 'God is love', 'Pray without ceasing', 'Rejoice always'],
      answer: 'Jesus wept',
      explanation: 'John 11:35 is the shortest verse in the English Bible.'
    }
  ],
  'Acts': [
    {
      id: 'act-fb-1',
      verse: 'Acts 1:8',
      text: 'But you will receive power when the Holy Spirit has come upon you, and you will be my witnesses in Jerusalem and in all Judea and Samaria, and to the end of the earth.',
      question: 'When would the disciples receive power?',
      options: ['When the Holy Spirit comes', 'When Jesus returns', 'When they reach Rome', 'When they fast'],
      answer: 'When the Holy Spirit comes',
      explanation: 'Acts 1:8 promises power through the Holy Spirit for witnessing.'
    },
    {
      id: 'act-fb-2',
      verse: 'Acts 9:3',
      text: 'Now as he went on his way, he approached Damascus, and suddenly a light from heaven shone around him.',
      question: 'Where was Saul going when the light from heaven shone around him?',
      options: ['Damascus', 'Jerusalem', 'Antioch', 'Rome'],
      answer: 'Damascus',
      explanation: 'Saul was on the road to Damascus when he encountered the risen Christ.'
    }
  ],
  'Romans': [
    {
      id: 'rom-fb-1',
      verse: 'Romans 3:23',
      text: 'for all have sinned and fall short of the glory of God,',
      question: 'According to Romans 3:23, who has sinned?',
      options: ['All', 'Only the wicked', 'Only the Gentiles', 'No one'],
      answer: 'All',
      explanation: 'The verse states that all have sinned and fall short of God\'s glory.'
    },
    {
      id: 'rom-fb-2',
      verse: 'Romans 8:28',
      text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
      question: 'For whom do all things work together for good?',
      options: ['Those who love God', 'Everyone', 'Only the perfect', 'The wealthy'],
      answer: 'Those who love God',
      explanation: 'Romans 8:28 promises that all things work together for good for those who love God.'
    }
  ],
  'Proverbs': [
    {
      id: 'pro-fb-1',
      verse: 'Proverbs 1:7',
      text: 'The fear of the LORD is the beginning of knowledge; fools despise wisdom and instruction.',
      question: 'What is the beginning of knowledge?',
      options: ['The fear of the LORD', 'Reading many books', 'Wealth', 'Age'],
      answer: 'The fear of the LORD',
      explanation: 'Proverbs 1:7 states that the fear of the LORD is the beginning of knowledge.'
    }
  ],
  'Revelation': [
    {
      id: 'rev-fb-1',
      verse: 'Revelation 1:8',
      text: '"I am the Alpha and the Omega," says the Lord God, "who is and who was and who is to come, the Almighty."',
      question: 'What does the Lord call Himself in Revelation 1:8?',
      options: ['The Alpha and the Omega', 'The First and the Last', 'The King of Kings', 'The Morning Star'],
      answer: 'The Alpha and the Omega',
      explanation: 'God identifies Himself as the Alpha and the Omega, the beginning and the end.'
    }
  ],
  '1 Samuel': [
    {
      id: '1sam-fb-1',
      verse: '1 Samuel 3:10',
      text: 'And the LORD came and stood, calling as at other times, "Samuel! Samuel!" And Samuel said, "Speak, for your servant hears."',
      question: 'What was Samuel\'s response when the LORD called him?',
      options: ['Speak, for your servant hears', 'Here I am', 'Who is there?', 'I am listening'],
      answer: 'Speak, for your servant hears',
      explanation: 'Samuel responded as Eli instructed him, showing his readiness to hear from God.'
    },
    {
      id: '1sam-fb-2',
      verse: '1 Samuel 16:7',
      text: 'But the LORD said to Samuel, "Do not look on his appearance or on the height of his stature, because I have rejected him. For the LORD sees not as man sees: man looks on the outward appearance, but the LORD looks on the heart."',
      question: 'Where does the LORD look, according to 1 Samuel 16:7?',
      options: ['On the heart', 'On the outward appearance', 'On the height of stature', 'On the strength of the arm'],
      answer: 'On the heart',
      explanation: 'God told Samuel that while man looks at the outside, God looks at the heart.'
    },
    {
      id: '1sam-fb-3',
      verse: '1 Samuel 17:49',
      text: 'And David put his hand in his bag and took out a stone and slung it and struck the Philistine on his forehead. The stone sank into his forehead, and he fell on his face to the ground.',
      question: 'What did David use to strike down Goliath?',
      options: ['A stone and a sling', 'A sword', 'A spear', 'A bow and arrow'],
      answer: 'A stone and a sling',
      explanation: 'David defeated the giant Goliath with a single stone from his sling.'
    }
  ],
  '2 Samuel': [
    {
      id: '2sam-fb-1',
      verse: '2 Samuel 7:12',
      text: 'When your days are fulfilled and you lie down with your fathers, I will raise up your offspring after you, who shall come from your body, and I will establish his kingdom.',
      question: 'To whom did God make this promise about an eternal kingdom?',
      options: ['David', 'Saul', 'Solomon', 'Absalom'],
      answer: 'David',
      explanation: 'This is part of the Davidic Covenant, where God promises David an enduring dynasty.'
    }
  ],
  'Luke': [
    {
      id: 'luk-fb-1',
      verse: 'Luke 2:7',
      text: 'And she gave birth to her firstborn son and wrapped him in swaddling cloths and laid him in a manger, because there was no place for them in the inn.',
      question: 'Where was Jesus laid after he was born?',
      options: ['In a manger', 'In a bed', 'On the floor', 'In a cradle'],
      answer: 'In a manger',
      explanation: 'Because there was no room in the inn, Mary laid Jesus in a manger.'
    },
    {
      id: 'luk-fb-2',
      verse: 'Luke 10:33',
      text: 'But a Samaritan, as he journeyed, came to where he was, and when he saw him, he had compassion.',
      question: 'In the parable of the Good Samaritan, who stopped to help the injured man?',
      options: ['A Samaritan', 'A Priest', 'A Levite', 'A Pharisee'],
      answer: 'A Samaritan',
      explanation: 'The Samaritan was the one who showed mercy and compassion to the man who had been robbed.'
    }
  ],
  'Mark': [
    {
      id: 'mrk-fb-1',
      verse: 'Mark 1:17',
      text: 'And Jesus said to them, "Follow me, and I will make you become fishers of men."',
      question: 'What did Jesus say he would make his followers?',
      options: ['Fishers of men', 'Shepherds of sheep', 'Builders of houses', 'Teachers of law'],
      answer: 'Fishers of men',
      explanation: 'Jesus called Simon and Andrew to follow him and become fishers of men.'
    }
  ],
  'Leviticus': [
    {
      id: 'lev-fb-1',
      verse: 'Leviticus 19:18',
      text: 'You shall not take vengeance or bear a grudge against the sons of your own people, but you shall love your neighbor as yourself: I am the LORD.',
      question: 'What command does God give regarding one\'s neighbor in Leviticus 19:18?',
      options: ['Love your neighbor as yourself', 'Avoid your neighbor', 'Judge your neighbor', 'Ignore your neighbor'],
      answer: 'Love your neighbor as yourself',
      explanation: 'Leviticus 19:18 is the source of the famous command to love your neighbor as yourself.'
    }
  ],
  'Numbers': [
    {
      id: 'num-fb-1',
      verse: 'Numbers 6:24-26',
      text: 'The LORD bless you and keep you; the LORD make his face to shine upon you and be gracious to you; the LORD lift up his countenance upon you and give you peace.',
      question: 'What is this famous blessing often called?',
      options: ['The Priestly Blessing', 'The Shepherd\'s Prayer', 'The Song of Moses', 'The Covenant Promise'],
      answer: 'The Priestly Blessing',
      explanation: 'This is the Aaronic or Priestly Blessing that God commanded the priests to speak over the people.'
    },
    {
      id: 'num-fb-2',
      verse: 'Numbers 21:9',
      text: 'So Moses made a bronze serpent and set it on a pole. And if a serpent bit anyone, he would look at the bronze serpent and live.',
      question: 'What did Moses make to save the people from the fiery serpents?',
      options: ['A bronze serpent', 'A golden calf', 'A wooden cross', 'A stone altar'],
      answer: 'A bronze serpent',
      explanation: 'God instructed Moses to make a bronze serpent and put it on a pole for healing.'
    }
  ],
  'Deuteronomy': [
    {
      id: 'deu-fb-1',
      verse: 'Deuteronomy 6:5',
      text: 'You shall love the LORD your God with all your heart and with all your soul and with all your might.',
      question: 'What is the greatest commandment according to Deuteronomy 6:5?',
      options: ['Love the LORD with all your heart', 'Keep the Sabbath', 'Honor your parents', 'Do not steal'],
      answer: 'Love the LORD with all your heart',
      explanation: 'This verse, part of the Shema, commands total devotion to God.'
    }
  ],
  'Acts': [
    {
      id: 'act-fb-1',
      verse: 'Acts 1:8',
      text: 'But you will receive power when the Holy Spirit has come upon you, and you will be my witnesses in Jerusalem and in all Judea and Samaria, and to the end of the earth.',
      question: 'What will the disciples receive when the Holy Spirit comes upon them?',
      options: ['Power', 'Wealth', 'Fame', 'Safety'],
      answer: 'Power',
      explanation: 'Jesus promised his disciples power through the Holy Spirit to be his witnesses.'
    }
  ],
  'Psalms': [
    {
      id: 'psa-fb-1',
      verse: 'Psalm 23:1',
      text: 'The LORD is my shepherd; I shall not want.',
      question: 'Who is the shepherd according to Psalm 23:1?',
      options: ['The LORD', 'David', 'Moses', 'Abraham'],
      answer: 'The LORD',
      explanation: 'David begins this famous Psalm by identifying the Lord as his shepherd.'
    }
  ]
};
