const SEED = [
{ id:'seed-1', createdAt:2,
  title:'أُخْفِي هَوَاكِ',
  note:'من البحر البسيط · قافية اللام المضمومة (ـلُهُ)',
  lines:[
"أُخْفِي هَوَاكِ وَفِي الْأَحْشَاءِ أُشْعِلُهُ | كَأَنَّ قَلْبِيَ يَخْشَى الْبَوْحَ يَحْمِلُهُ",
"مُنْذُ الْبِدَايَةِ وَالْأَيَّامُ شَاهِدَةٌ | عَلَى فُؤَادٍ غَدَا ذِكْرَاكِ يَشْغَلُهُ",
"وَكُلَّمَا مَرَّ طَيْفٌ مِنْكِ فِي خَلَدِي | أَحْسَسْتُ ثِقْلًا عَلَى صَدْرِي يُثَقِّلُهُ",
"كَأَنَّ صَخْرًا عَظِيمًا حَلَّ فِي ضِلَعِي | فَمَا يُطِيقُ فُؤَادِي كَيْفَ يَنْقُلُهُ",
"إِذَا أَتَى اللَّيْلُ وَاسْتَوْحَشْتُ ظُلْمَتَهُ | عَادَ الْحَنِينُ وَأَحْيَا مَا أُؤَمِّلُهُ",
"أُطِيلُ صَمْتِيَ وَالْأَفْكَارُ تَسْأَلُنِي | كَيْفَ السَّبِيلُ لِقَلْبٍ أَنْتِ قَاتِلُهُ",
"أَمْضِي وَفِي دَاخِلِي كَرْبٌ أُكَابِدُهُ | وَالنَّاسُ لَا يَعْلَمُونَ الْحِمْلَ أَحْمِلُهُ",
"مَا كُنْتُ أَعْلَمُ أَنَّ الذِّكْرَ يُتْعِبُنِي | وَأَنَّ طَيْفًا نَأَى فِي الْقَلْبِ يُذْبِلُهُ",
"أُحِبُّ فِي صَمْتِ قَلْبِي لَا أَبُوحُ بِهِ | كَأَنَّ سِرِّيَ بَيْنَ الضِّلْعِ يُقْفِلُهُ",
"يَا رَبِّ إِنْ كَانَ هَذَا الْحُبُّ مُتَّسِعًا | لِلْخَيْرِ فَاجْعَلْ جَمِيلَ الْخَيْرِ يَشْمَلُهُ",
"وَإِنْ يَكُنْ لَيْسَ لِي فَارْزُقْ فُؤَادِيَ أَنْ | يَرْتَاحَ مِنْ وَجَعٍ قَدْ بَاتَ يُنْحِلُهُ",
"فَمَا أَرَدْتُ سِوَى قَلْبٍ يَطِيبُ بِهِ | قَلْبِي وَلَا شَجَنٍ فِي الْعُمْرِ يُثْقِلُهُ"],
  meaning:`I hide my love for you, yet it burns inside me, as if my heart fears speaking of it and still carries it. Since the beginning the days have witnessed a heart occupied by your memory. Whenever your image passes through my mind, a weight settles on my chest, like a great rock my heart cannot carry.

When night comes and its darkness frightens me, the longing returns and wakes what I hope for. I stay silent while my thoughts ask: how can there be a way out for a heart that you are killing? I walk on with hidden pain and no one knows the burden I carry. I never knew a memory could exhaust me, or that a distant phantom could wear my heart away.

I love in silence and never say it, as if my secret locks my heart behind my ribs. Lord, if this love can open to good, let the beauty of good encompass it. If it is not mine, let my heart rest from the pain that wastes it, for all I wanted was a heart my heart could rest in, not a lifelong sorrow to carry.`},
{ id:'seed-2', createdAt:1,
  title:'إِلَى اللهِ أَرْفَعُ حِكَايَتِي',
  note:'من البحر الطويل · قافية الراء المكسورة (ـرِ)',
  lines:[
"بِدَايَةُ قِصَّتِي وَقَلْبِيَ لَمْ يَدْرِ | بِأَنَّ الْهَوَى سَيَسْتَبِدُّ مَدَى الدَّهْرِ",
"وَمَا كُنْتُ أَدْرِي أَنَّ طَيْفًا لِنَاظِرِي | سَيَبْقَى طَوِيلًا فِي الْفُؤَادِ وَفِي الْفِكْرِ",
"مَضَتْ سَنَوَاتُ الدَّرْسِ وَالْقَلْبُ لَمْ يَزَلْ | يُرَدِّدُ ذِكْرَى لَا تَغِيبُ عَنِ الصَّدْرِ",
"أُحَاوِلُ أَنْ أَنْأَى وَفِكْرِي مُشَتَّتٌ | وَيَجْذُبُنِي طَيْفٌ إِلَى عَالَمِ السِّحْرِ",
"أَرَى فِي خَيَالِي لِلْغَدِ الْوَرْدَ وَالْمُنَى | وَأَبْنِي مِنَ الْأَحْلَامِ قَصْرًا مِنَ الْعُمْرِ",
"فَإِنْ عُدْتُ لِلْحَقِيقَةِ اسْتَيْقَظَ الْأَسَى | وَضَاقَ فَضَاءُ الْأَرْضِ وَالصَّدْرُ فِي الْحَصْرِ",
"وَتَجْرِي دُمُوعِي حِينَ أَذْكُرُ أَنَّنِي | أُعَلِّقُ آمَالًا بِغَيْبٍ مِنَ الْقَدْرِ",
"أَيَا رَبِّ إِنَّ الْقَلْبَ أَضْحَى مُحَيَّرًا | فَهَبْ لِيَ مِنْ لُطْفِ الْهُدَى وَاسِعَ الْأَجْرِ",
"فَإِنْ كَانَ فِي الْقُرْبِ الْحَلَالِ سَعَادَةٌ | فَيَسِّرْ لَنَا مَا كَانَ خَيْرًا مِنَ الْأَمْرِ",
"وَإِنْ لَمْ يَكُنْ فِي الْجَمْعِ خَيْرٌ لِعَاقِبِي | فَطَهِّرْ فُؤَادِي مِنْ تَعَلُّقِهِ الْجَمْرِ",
"وَلَا تَجْعَلِ الْأَحْلَامَ تَمْلِكُ مُهْجَتِي | وَلَا تَجْعَلِ الْأَيَّامَ تَسْطُو عَلَى الصَّبْرِ",
"فَإِنِّي إِلَى الرَّحْمَنِ أَرْفَعُ قِصَّتِي | وَأُودِعُهُ سِرِّي وَمَا ضَاقَ فِي الْعُسْرِ",
"فَيَا رَبِّ إِنِّي قَدْ وَكَلْتُكَ حَاجَتِي | فَأَنْزِلْ عَلَى قَلْبِي سَكِينَةَ ذِكْرٍ",
"وَإِنْ طَالَ دَرْبِي فَالرَّجَاءُ بِرَحْمَةٍ | وَإِنْ غَابَ مَا أَرْجُو فَمَا لِي سِوَى الصَّبْرِ"],
  meaning:`My story began and my heart did not know that love would rule it all my life. I never knew that a mere glimpse would stay long in my heart and mind. Years of study passed and my heart still repeats a memory that never leaves my chest. I try to move away, my mind scattered, while a phantom pulls me into a world of enchantment. In my imagination I see tomorrow's roses and wishes and build a palace of dreams from my life. When I return to reality, sorrow wakes, the earth feels narrow and my chest tightens. My tears fall when I remember I am hanging hopes on the unseen.

Then the prayer begins. O Lord, my heart is perplexed, so grant me guidance and abundant reward. If lawful union holds happiness, make easy what is best. If union is not good for my end, cleanse my heart of its burning attachment. Do not let dreams own my soul or the days overpower my patience. I raise my story to the Most Merciful and entrust Him with my secret. Lord, I have entrusted You with my need, so send tranquility down on my heart. If my road is long, my hope is in mercy, and if what I want is absent, I have only patience.`}
];
