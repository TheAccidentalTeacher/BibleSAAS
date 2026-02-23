import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CatechismItem {
  n: number;
  ld?: number;   // lord_day (Heidelberg)
  q: string;
  a: string;
  refs: string[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isComplete(seedName: string): Promise<boolean> {
  const { data } = await supabase
    .from('seed_checkpoints')
    .select('status')
    .eq('seed_name', seedName)
    .single();
  return data?.status === 'complete';
}

async function getCheckpoint(seedName: string): Promise<number | null> {
  const { data } = await supabase
    .from('seed_checkpoints')
    .select('last_checkpoint, status')
    .eq('seed_name', seedName)
    .single();
  if (!data || data.status === 'complete') return null;
  return data.last_checkpoint ? parseInt(data.last_checkpoint) : null;
}

async function saveCheckpoint(seedName: string, lastQ: number, rowsInserted: number) {
  await supabase.from('seed_checkpoints').upsert(
    {
      seed_name: seedName,
      last_checkpoint: String(lastQ),
      rows_inserted: rowsInserted,
      status: 'in_progress',
      last_updated_at: new Date().toISOString(),
    },
    { onConflict: 'seed_name' }
  );
}

async function markComplete(seedName: string, total: number, rowsInserted: number) {
  await supabase.from('seed_checkpoints').upsert(
    {
      seed_name: seedName,
      last_checkpoint: String(total),
      rows_inserted: rowsInserted,
      status: 'complete',
      last_updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'seed_name' }
  );
}

async function seedCatechism(
  seedName: string,
  catKey: string,
  items: CatechismItem[]
) {
  console.log(`\n=== ${catKey.toUpperCase()} (${items.length} Q&As) ===`);

  if (await isComplete(seedName)) {
    console.log('  Already complete — skipping.');
    return;
  }

  const checkpoint = await getCheckpoint(seedName);
  const startAt = checkpoint ? checkpoint + 1 : 1;
  console.log(`  Starting from Q${startAt}`);

  let rowsInserted = 0;

  for (const item of items) {
    if (item.n < startAt) continue;

    const { error } = await supabase.from('catechism_entries').upsert(
      {
        catechism: catKey,
        question_number: item.n,
        lord_day: item.ld ?? null,
        section: null,
        question_text: item.q,
        answer_text: item.a,
        scripture_refs: item.refs,
        proof_texts: null,
        keywords: null,
        charles_note: null,
        meta: null,
      },
      { onConflict: 'catechism,question_number' }
    );

    if (error) {
      console.error(`  Error at Q${item.n}:`, error.message);
      await saveCheckpoint(seedName, item.n - 1, rowsInserted);
      process.exit(1);
    }

    rowsInserted++;

    if (item.n % 20 === 0) {
      await saveCheckpoint(seedName, item.n, rowsInserted);
      console.log(`  [Q${item.n}] ${rowsInserted} rows inserted`);
    }

    await sleep(40);
  }

  await markComplete(seedName, items.length, rowsInserted);
  console.log(`  Complete: ${rowsInserted} rows inserted.`);
}

// Westminster Shorter Catechism — 107 Q&As (public domain, 1648)
const WSC: CatechismItem[] = [
  {
    n: 1,
    q: "What is the chief end of man?",
    a: "Man's chief end is to glorify God, and to enjoy him forever.",
    refs: ["1 Cor. 10:31", "Ps. 73:25-28"],
  },
  {
    n: 2,
    q: "What rule hath God given to direct us how we may glorify and enjoy him?",
    a: "The Word of God, which is contained in the Scriptures of the Old and New Testaments, is the only rule to direct us how we may glorify and enjoy him.",
    refs: ["2 Tim. 3:16", "Eph. 2:20"],
  },
  {
    n: 3,
    q: "What do the Scriptures principally teach?",
    a: "The Scriptures principally teach what man is to believe concerning God, and what duty God requires of man.",
    refs: ["2 Tim. 1:13", "Mic. 6:8"],
  },
  {
    n: 4,
    q: "What is God?",
    a: "God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.",
    refs: ["John 4:24", "Ps. 90:2", "Jas. 1:17", "Rev. 4:8"],
  },
  {
    n: 5,
    q: "Are there more Gods than one?",
    a: "There is but one only, the living and true God.",
    refs: ["Deut. 6:4", "Jer. 10:10"],
  },
  {
    n: 6,
    q: "How many persons are there in the Godhead?",
    a: "There are three persons in the Godhead: the Father, the Son, and the Holy Ghost; and these three are one God, the same in substance, equal in power and glory.",
    refs: ["1 John 5:7", "Matt. 28:19"],
  },
  {
    n: 7,
    q: "What are the decrees of God?",
    a: "The decrees of God are his eternal purpose, according to the counsel of his will, whereby, for his own glory, he hath foreordained whatsoever comes to pass.",
    refs: ["Eph. 1:11", "Rom. 9:22-23"],
  },
  {
    n: 8,
    q: "How doth God execute his decrees?",
    a: "God executeth his decrees in the works of creation and providence.",
    refs: ["Rev. 4:11", "Dan. 4:35"],
  },
  {
    n: 9,
    q: "What is the work of creation?",
    a: "The work of creation is God's making all things of nothing, by the word of his power, in the space of six days, and all very good.",
    refs: ["Gen. 1:1", "Heb. 11:3"],
  },
  {
    n: 10,
    q: "How did God create man?",
    a: "God created man male and female, after his own image, in knowledge, righteousness, and holiness, with dominion over the creatures.",
    refs: ["Gen. 1:26-28", "Col. 3:10", "Eph. 4:24"],
  },
  {
    n: 11,
    q: "What are God's works of providence?",
    a: "God's works of providence are his most holy, wise, and powerful preserving and governing all his creatures, and all their actions.",
    refs: ["Ps. 145:17", "Heb. 1:3"],
  },
  {
    n: 12,
    q: "What special act of providence did God exercise toward man in the estate wherein he was created?",
    a: "When God had created man, he entered into a covenant of life with him, upon condition of perfect obedience; forbidding him to eat of the tree of the knowledge of good and evil, upon the pain of death.",
    refs: ["Gal. 3:12", "Gen. 2:16-17"],
  },
  {
    n: 13,
    q: "Did our first parents continue in the estate wherein they were created?",
    a: "Our first parents, being left to the freedom of their own will, fell from the estate wherein they were created, by sinning against God.",
    refs: ["Gen. 3:6-8", "Eccl. 7:29"],
  },
  {
    n: 14,
    q: "What is sin?",
    a: "Sin is any want of conformity unto, or transgression of, the law of God.",
    refs: ["1 John 3:4"],
  },
  {
    n: 15,
    q: "What was the sin whereby our first parents fell from the estate wherein they were created?",
    a: "The sin whereby our first parents fell from the estate wherein they were created was their eating the forbidden fruit.",
    refs: ["Gen. 3:6"],
  },
  {
    n: 16,
    q: "Did all mankind fall in Adam's first transgression?",
    a: "The covenant being made with Adam, not only for himself, but for his posterity; all mankind, descending from him by ordinary generation, sinned in him, and fell with him, in his first transgression.",
    refs: ["Rom. 5:12", "1 Cor. 15:22"],
  },
  {
    n: 17,
    q: "Into what estate did the Fall bring mankind?",
    a: "The Fall brought mankind into an estate of sin and misery.",
    refs: ["Rom. 5:18-19"],
  },
  {
    n: 18,
    q: "Wherein consists the sinfulness of that estate whereinto man fell?",
    a: "The sinfulness of that estate whereinto man fell consists in the guilt of Adam's first sin, the want of original righteousness, and the corruption of his whole nature, which is commonly called original sin; together with all actual transgressions which proceed from it.",
    refs: ["Rom. 5:12", "Rom. 3:10-18", "Jas. 1:14-15"],
  },
  {
    n: 19,
    q: "What is the misery of that estate whereinto man fell?",
    a: "All mankind by their fall lost communion with God, are under his wrath and curse, and so made liable to all the miseries in this life, to death itself, and to the pains of hell forever.",
    refs: ["Gen. 3:17-19", "Lam. 3:39", "Rom. 6:23", "Matt. 25:41"],
  },
  {
    n: 20,
    q: "Did God leave all mankind to perish in the estate of sin and misery?",
    a: "God, having out of his mere good pleasure, from all eternity, elected some to everlasting life, did enter into a covenant of grace, to deliver them out of the estate of sin and misery, and to bring them into an estate of salvation by a Redeemer.",
    refs: ["Eph. 1:4", "Rom. 3:20-22", "Gal. 3:21-22"],
  },
  {
    n: 21,
    q: "Who is the Redeemer of God's elect?",
    a: "The only Redeemer of God's elect is the Lord Jesus Christ, who, being the eternal Son of God, became man, and so was, and continueth to be, God and man in two distinct natures, and one person, forever.",
    refs: ["1 Tim. 2:5", "John 1:14", "Luke 1:35"],
  },
  {
    n: 22,
    q: "How did Christ, being the Son of God, become man?",
    a: "Christ, the Son of God, became man, by taking to himself a true body and a reasonable soul, being conceived by the power of the Holy Ghost in the womb of the Virgin Mary, and born of her, yet without sin.",
    refs: ["Heb. 2:14", "Matt. 26:38", "Luke 1:35", "Heb. 4:15"],
  },
  {
    n: 23,
    q: "What offices doth Christ execute as our Redeemer?",
    a: "Christ, as our Redeemer, executeth the offices of a prophet, of a priest, and of a king, both in his estate of humiliation and exaltation.",
    refs: ["Acts 3:22", "Heb. 5:6", "Ps. 2:6"],
  },
  {
    n: 24,
    q: "How doth Christ execute the office of a prophet?",
    a: "Christ executeth the office of a prophet, in revealing to us, by his Word and Spirit, the will of God for our salvation.",
    refs: ["John 1:18", "John 20:31"],
  },
  {
    n: 25,
    q: "How doth Christ execute the office of a priest?",
    a: "Christ executeth the office of a priest, in his once offering up of himself a sacrifice to satisfy divine justice, and reconcile us to God; and in making continual intercession for us.",
    refs: ["Heb. 9:28", "Heb. 7:25"],
  },
  {
    n: 26,
    q: "How doth Christ execute the office of a king?",
    a: "Christ executeth the office of a king, in subduing us to himself, in ruling and defending us, and in restraining and conquering all his and our enemies.",
    refs: ["Acts 15:15-16", "Isa. 33:22", "1 Cor. 15:25"],
  },
  {
    n: 27,
    q: "Wherein did Christ's humiliation consist?",
    a: "Christ's humiliation consisted in his being born, and that in a low condition, made under the law, undergoing the miseries of this life, the wrath of God, and the cursed death of the cross; in being buried, and continuing under the power of death for a time.",
    refs: ["Luke 2:7", "Gal. 4:4", "Heb. 12:2-3", "Phil. 2:8", "Acts 2:24-27"],
  },
  {
    n: 28,
    q: "Wherein consisteth Christ's exaltation?",
    a: "Christ's exaltation consisteth in his rising again from the dead on the third day, in ascending up into heaven, in sitting at the right hand of God the Father, and in coming to judge the world at the last day.",
    refs: ["1 Cor. 15:4", "Acts 1:11", "Eph. 1:20", "Acts 17:31"],
  },
  {
    n: 29,
    q: "How are we made partakers of the redemption purchased by Christ?",
    a: "We are made partakers of the redemption purchased by Christ, by the effectual application of it to us by his Holy Spirit.",
    refs: ["John 1:12-13", "Titus 3:5-6"],
  },
  {
    n: 30,
    q: "How doth the Spirit apply to us the redemption purchased by Christ?",
    a: "The Spirit applieth to us the redemption purchased by Christ, by working faith in us, and thereby uniting us to Christ in our effectual calling.",
    refs: ["Eph. 2:8", "Eph. 3:17"],
  },
  {
    n: 31,
    q: "What is effectual calling?",
    a: "Effectual calling is the work of God's Spirit, whereby, convincing us of our sin and misery, enlightening our minds in the knowledge of Christ, and renewing our wills, he doth persuade and enable us to embrace Jesus Christ, freely offered to us in the gospel.",
    refs: ["2 Tim. 1:9", "Acts 26:18", "Ezek. 11:19", "John 6:44-45"],
  },
  {
    n: 32,
    q: "What benefits do they that are effectually called partake of in this life?",
    a: "They that are effectually called do in this life partake of justification, adoption, and sanctification, and the several benefits which in this life do either accompany or flow from them.",
    refs: ["Rom. 8:30", "Eph. 1:5", "1 Cor. 1:30"],
  },
  {
    n: 33,
    q: "What is justification?",
    a: "Justification is an act of God's free grace, wherein he pardoneth all our sins, and accepteth us as righteous in his sight, only for the righteousness of Christ imputed to us, and received by faith alone.",
    refs: ["Rom. 3:24", "2 Cor. 5:21", "Rom. 5:17-19", "Phil. 3:9"],
  },
  {
    n: 34,
    q: "What is adoption?",
    a: "Adoption is an act of God's free grace, whereby we are received into the number, and have a right to all the privileges, of the sons of God.",
    refs: ["1 John 3:1", "John 1:12"],
  },
  {
    n: 35,
    q: "What is sanctification?",
    a: "Sanctification is the work of God's free grace, whereby we are renewed in the whole man after the image of God, and are enabled more and more to die unto sin, and live unto righteousness.",
    refs: ["2 Thess. 2:13", "Eph. 4:23-24", "Rom. 6:4-6"],
  },
  {
    n: 36,
    q: "What are the benefits which in this life do accompany or flow from justification, adoption, and sanctification?",
    a: "The benefits which in this life do accompany or flow from justification, adoption, and sanctification, are, assurance of God's love, peace of conscience, joy in the Holy Ghost, increase of grace, and perseverance therein to the end.",
    refs: ["Rom. 5:1-2", "Rom. 14:17", "Prov. 4:18", "1 Pet. 1:5"],
  },
  {
    n: 37,
    q: "What benefits do believers receive from Christ at death?",
    a: "The souls of believers are at their death made perfect in holiness, and do immediately pass into glory; and their bodies, being still united to Christ, do rest in their graves till the resurrection.",
    refs: ["Heb. 12:23", "2 Cor. 5:1-8", "Phil. 1:23", "1 Thess. 4:14"],
  },
  {
    n: 38,
    q: "What benefits do believers receive from Christ at the resurrection?",
    a: "At the resurrection, believers being raised up in glory, shall be openly acknowledged and acquitted in the day of judgment, and made perfectly blessed in the full enjoying of God to all eternity.",
    refs: ["1 Cor. 15:43", "Matt. 25:23", "1 John 3:2"],
  },
  {
    n: 39,
    q: "What is the duty which God requireth of man?",
    a: "The duty which God requireth of man is obedience to his revealed will.",
    refs: ["Mic. 6:8", "1 Sam. 15:22"],
  },
  {
    n: 40,
    q: "What did God at first reveal to man for the rule of his obedience?",
    a: "The rule which God at first revealed to man for his obedience was the moral law.",
    refs: ["Rom. 2:14-15", "Rom. 10:5"],
  },
  {
    n: 41,
    q: "Wherein is the moral law summarily comprehended?",
    a: "The moral law is summarily comprehended in the ten commandments.",
    refs: ["Deut. 10:4", "Matt. 19:17"],
  },
  {
    n: 42,
    q: "What is the sum of the ten commandments?",
    a: "The sum of the ten commandments is to love the Lord our God with all our heart, with all our soul, with all our strength, and with all our mind; and our neighbour as ourselves.",
    refs: ["Matt. 22:37-40"],
  },
  {
    n: 43,
    q: "What is the preface to the ten commandments?",
    a: "The preface to the ten commandments is in these words, I am the Lord thy God, which have brought thee out of the land of Egypt, out of the house of bondage.",
    refs: ["Exod. 20:2"],
  },
  {
    n: 44,
    q: "What doth the preface to the ten commandments teach us?",
    a: "The preface to the ten commandments teacheth us that, because God is the Lord, and our God, and Redeemer, therefore we are bound to keep all his commandments.",
    refs: ["Luke 1:74-75"],
  },
  {
    n: 45,
    q: "Which is the first commandment?",
    a: "The first commandment is, Thou shalt have no other gods before me.",
    refs: ["Exod. 20:3"],
  },
  {
    n: 46,
    q: "What is required in the first commandment?",
    a: "The first commandment requireth us to know and acknowledge God to be the only true God, and our God; and to worship and glorify him accordingly.",
    refs: ["1 Chron. 28:9", "Deut. 26:17", "Matt. 4:10"],
  },
  {
    n: 47,
    q: "What is forbidden in the first commandment?",
    a: "The first commandment forbiddeth the denying, or not worshipping and glorifying the true God as God, and our God; and the giving of that worship and glory to any other, which is due to him alone.",
    refs: ["Ps. 14:1", "Rom. 1:21", "Phil. 2:11"],
  },
  {
    n: 48,
    q: "What are we specially taught by these words before me in the first commandment?",
    a: "These words before me in the first commandment teach us that God, who seeth all things, taketh notice of, and is much displeased with, the sin of having any other God.",
    refs: ["Ezek. 8:5-6", "Ps. 44:20-21"],
  },
  {
    n: 49,
    q: "Which is the second commandment?",
    a: "The second commandment is, Thou shalt not make unto thee any graven image, or any likeness of any thing that is in heaven above, or that is in the earth beneath, or that is in the water under the earth. Thou shalt not bow down thyself to them, nor serve them: for I the Lord thy God am a jealous God, visiting the iniquity of the fathers upon the children unto the third and fourth generation of them that hate me; and shewing mercy unto thousands of them that love me, and keep my commandments.",
    refs: ["Exod. 20:4-6"],
  },
  {
    n: 50,
    q: "What is required in the second commandment?",
    a: "The second commandment requireth the receiving, observing, and keeping pure and entire, all such religious worship and ordinances as God hath appointed in his Word.",
    refs: ["Deut. 32:46", "Matt. 28:20"],
  },
  {
    n: 51,
    q: "What is forbidden in the second commandment?",
    a: "The second commandment forbiddeth the worshipping of God by images, or any other way not appointed in his Word.",
    refs: ["Deut. 4:15-19", "Col. 2:18"],
  },
  {
    n: 52,
    q: "What are the reasons annexed to the second commandment?",
    a: "The reasons annexed to the second commandment are, God's sovereignty over us, his propriety in us, and the zeal he hath to his own worship.",
    refs: ["Ps. 45:11", "Exod. 34:13-14"],
  },
  {
    n: 53,
    q: "Which is the third commandment?",
    a: "The third commandment is, Thou shalt not take the name of the Lord thy God in vain: for the Lord will not hold him guiltless that taketh his name in vain.",
    refs: ["Exod. 20:7"],
  },
  {
    n: 54,
    q: "What is required in the third commandment?",
    a: "The third commandment requireth the holy and reverent use of God's names, titles, attributes, ordinances, Word, and works.",
    refs: ["Ps. 29:2", "Eccl. 5:1", "Rev. 15:3-4"],
  },
  {
    n: 55,
    q: "What is forbidden in the third commandment?",
    a: "The third commandment forbiddeth all profaning or abusing of any thing whereby God maketh himself known.",
    refs: ["Mal. 2:2", "Isa. 5:12"],
  },
  {
    n: 56,
    q: "What is the reason annexed to the third commandment?",
    a: "The reason annexed to the third commandment is that, however the breakers of this commandment may escape punishment from men, yet the Lord our God will not suffer them to escape his righteous judgment.",
    refs: ["Deut. 28:58-59", "1 Sam. 3:13"],
  },
  {
    n: 57,
    q: "Which is the fourth commandment?",
    a: "The fourth commandment is, Remember the sabbath-day, to keep it holy. Six days shalt thou labour, and do all thy work; but the seventh day is the sabbath of the Lord thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates: for in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the Lord blessed the sabbath-day and hallowed it.",
    refs: ["Exod. 20:8-11"],
  },
  {
    n: 58,
    q: "What is required in the fourth commandment?",
    a: "The fourth commandment requireth the keeping holy to God such set times as he hath appointed in his Word; expressly one whole day in seven, to be a holy sabbath to himself.",
    refs: ["Lev. 19:30", "Deut. 5:12"],
  },
  {
    n: 59,
    q: "Which day of the seven hath God appointed to be the weekly sabbath?",
    a: "From the beginning of the world to the resurrection of Christ, God appointed the seventh day of the week to be the weekly sabbath; and the first day of the week ever since, to continue to the end of the world, which is the Christian sabbath.",
    refs: ["Gen. 2:2-3", "Acts 20:7", "Rev. 1:10"],
  },
  {
    n: 60,
    q: "How is the sabbath to be sanctified?",
    a: "The sabbath is to be sanctified by a holy resting all that day, even from such worldly employments and recreations as are lawful on other days; and spending the whole time in the public and private exercises of God's worship, except so much as is to be taken up in the works of necessity and mercy.",
    refs: ["Isa. 58:13-14", "Matt. 12:11-12"],
  },
  {
    n: 61,
    q: "What is forbidden in the fourth commandment?",
    a: "The fourth commandment forbiddeth the omission or careless performance of the duties required, and the profaning the day by idleness, or doing that which is in itself sinful, or by unnecessary thoughts, words, or works, about our worldly employments or recreations.",
    refs: ["Ezek. 22:26", "Amos 8:5", "Neh. 13:15-17"],
  },
  {
    n: 62,
    q: "What are the reasons annexed to the fourth commandment?",
    a: "The reasons annexed to the fourth commandment are, God's allowing us six days of the week for our own employments, his challenging a special propriety in the seventh, his own example, and his blessing the sabbath day.",
    refs: ["Exod. 31:15-16", "Exod. 20:11"],
  },
  {
    n: 63,
    q: "Which is the fifth commandment?",
    a: "The fifth commandment is, Honour thy father and thy mother: that thy days may be long upon the land which the Lord thy God giveth thee.",
    refs: ["Exod. 20:12"],
  },
  {
    n: 64,
    q: "What is required in the fifth commandment?",
    a: "The fifth commandment requireth the preserving the honour of, and performing the duties belonging to, every one in their several places and relations, as superiors, inferiors, or equals.",
    refs: ["Rom. 13:1", "Eph. 5:21-22", "Eph. 6:1,5"],
  },
  {
    n: 65,
    q: "What is forbidden in the fifth commandment?",
    a: "The fifth commandment forbiddeth the neglecting of, or doing any thing against, the honour and duty which belongeth to every one in their several places and relations.",
    refs: ["Matt. 15:4-6", "Ezek. 34:2-4"],
  },
  {
    n: 66,
    q: "What is the reason annexed to the fifth commandment?",
    a: "The reason annexed to the fifth commandment is a promise of long life and prosperity (as far as it shall serve for God's glory and their own good) to all such as keep this commandment.",
    refs: ["Eph. 6:2-3"],
  },
  {
    n: 67,
    q: "Which is the sixth commandment?",
    a: "The sixth commandment is, Thou shalt not kill.",
    refs: ["Exod. 20:13"],
  },
  {
    n: 68,
    q: "What is required in the sixth commandment?",
    a: "The sixth commandment requireth all lawful endeavours to preserve our own life, and the life of others.",
    refs: ["Eph. 5:28-29", "1 Kings 18:4"],
  },
  {
    n: 69,
    q: "What is forbidden in the sixth commandment?",
    a: "The sixth commandment forbiddeth the taking away of our own life, or the life of our neighbour, unjustly, or whatsoever tendeth thereunto.",
    refs: ["Acts 16:28", "Gen. 9:6", "Matt. 5:22"],
  },
  {
    n: 70,
    q: "Which is the seventh commandment?",
    a: "The seventh commandment is, Thou shalt not commit adultery.",
    refs: ["Exod. 20:14"],
  },
  {
    n: 71,
    q: "What is required in the seventh commandment?",
    a: "The seventh commandment requireth the preservation of our own and our neighbour's chastity, in heart, speech, and behaviour.",
    refs: ["1 Thess. 4:4", "1 Pet. 3:2"],
  },
  {
    n: 72,
    q: "What is forbidden in the seventh commandment?",
    a: "The seventh commandment forbiddeth all unchaste thoughts, words, and actions.",
    refs: ["Matt. 5:28", "Eph. 5:3-4"],
  },
  {
    n: 73,
    q: "Which is the eighth commandment?",
    a: "The eighth commandment is, Thou shalt not steal.",
    refs: ["Exod. 20:15"],
  },
  {
    n: 74,
    q: "What is required in the eighth commandment?",
    a: "The eighth commandment requireth the lawful procuring and furthering the wealth and outward estate of ourselves and others.",
    refs: ["Prov. 27:23", "Lev. 25:35"],
  },
  {
    n: 75,
    q: "What is forbidden in the eighth commandment?",
    a: "The eighth commandment forbiddeth whatsoever doth or may unjustly hinder our own or our neighbour's wealth or outward estate.",
    refs: ["Prov. 21:17", "1 Tim. 5:8"],
  },
  {
    n: 76,
    q: "Which is the ninth commandment?",
    a: "The ninth commandment is, Thou shalt not bear false witness against thy neighbour.",
    refs: ["Exod. 20:16"],
  },
  {
    n: 77,
    q: "What is required in the ninth commandment?",
    a: "The ninth commandment requireth the maintaining and promoting of truth between man and man, and of our own and our neighbour's good name, especially in witness-bearing.",
    refs: ["Zech. 8:16", "3 John 1:12"],
  },
  {
    n: 78,
    q: "What is forbidden in the ninth commandment?",
    a: "The ninth commandment forbiddeth whatsoever is prejudicial to truth, or injurious to our own or our neighbour's good name.",
    refs: ["1 Sam. 17:28", "Lev. 19:16"],
  },
  {
    n: 79,
    q: "Which is the tenth commandment?",
    a: "The tenth commandment is, Thou shalt not covet thy neighbour's house, thou shalt not covet thy neighbour's wife, nor his manservant, nor his maidservant, nor his ox, nor his ass, nor any thing that is thy neighbour's.",
    refs: ["Exod. 20:17"],
  },
  {
    n: 80,
    q: "What is required in the tenth commandment?",
    a: "The tenth commandment requireth full contentment with our own condition, with a right and charitable frame of spirit toward our neighbour, and all that is his.",
    refs: ["Heb. 13:5", "1 Tim. 6:6", "Rom. 12:15"],
  },
  {
    n: 81,
    q: "What is forbidden in the tenth commandment?",
    a: "The tenth commandment forbiddeth all discontentment with our own estate, envying or grieving at the good of our neighbour, and all inordinate motions and affections to any thing that is his.",
    refs: ["1 Kings 21:4", "Gal. 5:26"],
  },
  {
    n: 82,
    q: "Is any man able perfectly to keep the commandments of God?",
    a: "No mere man since the fall is able in this life perfectly to keep the commandments of God, but doth daily break them in thought, word, and deed.",
    refs: ["Eccl. 7:20", "1 John 1:8", "Gal. 5:17"],
  },
  {
    n: 83,
    q: "Are all transgressions of the law equally heinous?",
    a: "Some sins in themselves, and by reason of several aggravations, are more heinous in the sight of God than others.",
    refs: ["John 19:11", "1 John 5:16"],
  },
  {
    n: 84,
    q: "What doth every sin deserve?",
    a: "Every sin deserveth God's wrath and curse, both in this life, and that which is to come.",
    refs: ["Eph. 5:6", "Gal. 3:10", "Lam. 3:39", "Matt. 25:41"],
  },
  {
    n: 85,
    q: "What doth God require of us that we may escape his wrath and curse due to us for sin?",
    a: "To escape the wrath and curse of God due to us for sin, God requireth of us faith in Jesus Christ, repentance unto life, with the diligent use of all the outward means whereby Christ communicateth to us the benefits of redemption.",
    refs: ["Acts 20:21", "Matt. 11:28"],
  },
  {
    n: 86,
    q: "What is faith in Jesus Christ?",
    a: "Faith in Jesus Christ is a saving grace, whereby we receive and rest upon him alone for salvation, as he is offered to us in the gospel.",
    refs: ["Heb. 10:39", "John 1:12", "Isa. 26:3-4"],
  },
  {
    n: 87,
    q: "What is repentance unto life?",
    a: "Repentance unto life is a saving grace, whereby a sinner, out of a true sense of his sin, and apprehension of the mercy of God in Christ, doth, with grief and hatred of his sin, turn from it unto God, with full purpose of, and endeavour after, new obedience.",
    refs: ["Acts 2:37-38", "Joel 2:13", "Jer. 31:18-19", "2 Cor. 7:11"],
  },
  {
    n: 88,
    q: "What are the outward and ordinary means whereby Christ communicateth to us the benefits of redemption?",
    a: "The outward and ordinary means whereby Christ communicateth to us the benefits of redemption are his ordinances, especially the Word, sacraments, and prayer; all which are made effectual to the elect for salvation.",
    refs: ["Matt. 28:19-20", "Acts 2:41-42"],
  },
  {
    n: 89,
    q: "How is the Word made effectual to salvation?",
    a: "The Spirit of God maketh the reading, but especially the preaching of the Word, an effectual means of convincing and converting sinners, and of building them up in holiness and comfort, through faith, unto salvation.",
    refs: ["Neh. 8:8", "1 Cor. 14:24-25", "Acts 26:18", "Ps. 19:7-8"],
  },
  {
    n: 90,
    q: "How is the Word to be read and heard, that it may become effectual to salvation?",
    a: "That the Word may become effectual to salvation, we must attend thereunto with diligence, preparation, and prayer; receive it with faith and love, lay it up in our hearts, and practise it in our lives.",
    refs: ["Prov. 8:34", "1 Pet. 1:25", "Heb. 4:2", "Ps. 119:11", "Jas. 1:25"],
  },
  {
    n: 91,
    q: "How do the sacraments become effectual means of salvation?",
    a: "The sacraments become effectual means of salvation, not from any virtue in them, or in him that doth administer them; but only by the blessing of Christ, and the working of his Spirit in them that by faith receive them.",
    refs: ["1 Pet. 3:21", "Acts 8:13,23"],
  },
  {
    n: 92,
    q: "What is a sacrament?",
    a: "A sacrament is a holy ordinance instituted by Christ, wherein, by sensible signs, Christ, and the benefits of the new covenant, are represented, sealed, and applied to believers.",
    refs: ["Gen. 17:7,10", "Matt. 28:19", "1 Cor. 11:23-26"],
  },
  {
    n: 93,
    q: "Which are the sacraments of the New Testament?",
    a: "The sacraments of the New Testament are Baptism and the Lord's Supper.",
    refs: ["Matt. 28:19", "1 Cor. 11:23-26"],
  },
  {
    n: 94,
    q: "What is Baptism?",
    a: "Baptism is a sacrament, wherein the washing with water in the name of the Father, and of the Son, and of the Holy Ghost, doth signify and seal our ingrafting into Christ, and partaking of the benefits of the covenant of grace, and our engagement to be the Lord's.",
    refs: ["Matt. 28:19", "Rom. 6:4", "Gal. 3:26-27"],
  },
  {
    n: 95,
    q: "To whom is Baptism to be administered?",
    a: "Baptism is not to be administered to any that are out of the visible church, till they profess their faith in Christ, and obedience to him; but the infants of such as are members of the visible church are to be baptized.",
    refs: ["Acts 2:38-39", "Acts 16:32-33", "Col. 2:11-12"],
  },
  {
    n: 96,
    q: "What is the Lord's Supper?",
    a: "The Lord's Supper is a sacrament, wherein, by giving and receiving bread and wine according to Christ's appointment, his death is showed forth; and the worthy receivers are, not after a corporal and carnal manner, but by faith, made partakers of his body and blood, with all his benefits, to their spiritual nourishment and growth in grace.",
    refs: ["1 Cor. 11:23-26", "1 Cor. 10:16"],
  },
  {
    n: 97,
    q: "What is required to the worthy receiving of the Lord's Supper?",
    a: "It is required of them that would worthily partake of the Lord's Supper, that they examine themselves of their knowledge to discern the Lord's body, of their faith to feed upon him, of their repentance, love, and new obedience; lest, coming unworthily, they eat and drink judgment to themselves.",
    refs: ["1 Cor. 11:27-31"],
  },
  {
    n: 98,
    q: "What is prayer?",
    a: "Prayer is an offering up of our desires unto God, for things agreeable to his will, in the name of Christ, with confession of our sins, and thankful acknowledgment of his mercies.",
    refs: ["Phil. 4:6", "1 John 5:14", "John 16:23-24"],
  },
  {
    n: 99,
    q: "What rule hath God given for our direction in prayer?",
    a: "The whole Word of God is of use to direct us in prayer; but the special rule of direction is that form of prayer which Christ taught his disciples, commonly called the Lord's Prayer.",
    refs: ["1 John 5:14", "Matt. 6:9-13"],
  },
  {
    n: 100,
    q: "What doth the preface of the Lord's Prayer teach us?",
    a: "The preface of the Lord's Prayer, which is Our Father which art in heaven, teacheth us to draw near to God with all holy reverence and confidence, as children to a father able and ready to help us; and that we should pray with and for others.",
    refs: ["Isa. 64:9", "Luke 11:13", "Acts 12:5"],
  },
  {
    n: 101,
    q: "What do we pray for in the first petition?",
    a: "In the first petition, which is Hallowed be thy name, we pray that God would enable us and others to glorify him in all that whereby he maketh himself known; and that he would dispose all things to his own glory.",
    refs: ["Ps. 67:1-3", "Ps. 83:18"],
  },
  {
    n: 102,
    q: "What do we pray for in the second petition?",
    a: "In the second petition, which is Thy kingdom come, we pray that Satan's kingdom may be destroyed; and that the kingdom of grace may be advanced, ourselves and others brought into it, and kept in it; and that the kingdom of glory may be hastened.",
    refs: ["Ps. 68:1", "2 Thess. 3:1", "Rev. 22:20"],
  },
  {
    n: 103,
    q: "What do we pray for in the third petition?",
    a: "In the third petition, which is Thy will be done in earth as it is in heaven, we pray that God, by his grace, would make us able and willing to know, obey, and submit to his will in all things, as the angels do in heaven.",
    refs: ["Ps. 67:5-7", "Ps. 119:36", "Acts 21:14"],
  },
  {
    n: 104,
    q: "What do we pray for in the fourth petition?",
    a: "In the fourth petition, which is Give us this day our daily bread, we pray that of God's free gift we may receive a competent portion of the good things of this life, and enjoy his blessing with them.",
    refs: ["Prov. 30:8-9", "1 Tim. 4:4-5"],
  },
  {
    n: 105,
    q: "What do we pray for in the fifth petition?",
    a: "In the fifth petition, which is And forgive us our debts, as we forgive our debtors, we pray that God, for Christ's sake, would freely pardon all our sins; which we are the rather encouraged to ask, because by his grace we are enabled from the heart to forgive others.",
    refs: ["Ps. 51:1-2", "Matt. 18:35"],
  },
  {
    n: 106,
    q: "What do we pray for in the sixth petition?",
    a: "In the sixth petition, which is And lead us not into temptation, but deliver us from evil, we pray that God would either keep us from being tempted to sin, or support and deliver us when we are tempted.",
    refs: ["Matt. 26:41", "Ps. 19:13", "2 Cor. 12:8"],
  },
  {
    n: 107,
    q: "What doth the conclusion of the Lord's Prayer teach us?",
    a: "The conclusion of the Lord's Prayer, which is For thine is the kingdom, and the power, and the glory, forever, Amen, teacheth us to take our encouragement in prayer from God only, and in our prayers to praise him, ascribing kingdom, power, and glory to him; and in testimony of our desire and assurance to be heard, we say Amen.",
    refs: ["Dan. 9:18-19", "1 Chron. 29:11-13", "Rev. 22:20"],
  },
];

async function main() {
  console.log('=== BibleSaaS — Catechism & Confession Seed ===\n');

  // Westminster Shorter Catechism — 107 Q&As
  await seedCatechism('wsc_catechism', 'wsc', WSC);

  // Heidelberg Catechism — 129 Q&As (Lord's Days 1–52)
  await seedCatechism('hc_catechism', 'hc', HC);

  // Westminster Larger Catechism + 1689 LBC added in subsequent seed runs
  // (see seed scripts: seed-catechism-wlc.ts, seed-confession-1689.ts)

  console.log('\n=== Catechism seed complete. ===');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// HEIDELBERG CATECHISM — 129 Q&As across 52 Lord's Days (public domain, 1563)
// ---------------------------------------------------------------------------
const HC: CatechismItem[] = [
  // LORD'S DAY 1
  { n: 1, ld: 1, q: "What is your only comfort in life and in death?", a: "That I am not my own, but belong—body and soul, in life and in death—to my faithful Savior, Jesus Christ. He has fully paid for all my sins with his precious blood, and has set me free from the tyranny of the devil. He also watches over me in such a way that not a hair can fall from my head without the will of my Father in heaven; in fact, all things must work together for my salvation. Because I belong to him, Christ, by his Holy Spirit, assures me of eternal life and makes me wholeheartedly willing and ready from now on to live for him.", refs: ["Rom. 14:7-9", "1 Cor. 6:19-20", "1 Cor. 3:23", "Titus 2:14", "1 Pet. 1:18-19", "1 John 1:7", "John 8:34-36", "Heb. 2:14-15", "Matt. 10:29-31", "Rom. 8:28", "John 6:39-40", "Rom. 8:16", "2 Cor. 1:21-22", "Rom. 8:14"] },
  { n: 2, ld: 1, q: "What must you know to live and die in the joy of this comfort?", a: "Three things: first, how great my sin and misery are; second, how I am set free from all my sins and their misery; third, how I am to thank God for such deliverance.", refs: ["Matt. 9:12", "Rom. 3:10", "1 John 1:9-10", "John 17:3", "Acts 4:12", "Acts 10:43", "Matt. 5:16", "Rom. 6:13"] },
  // LORD'S DAY 2
  { n: 3, ld: 2, q: "How do you come to know your misery?", a: "The law of God tells me.", refs: ["Rom. 3:20", "Rom. 7:7-25"] },
  { n: 4, ld: 2, q: "What does God's law require of us?", a: "Christ teaches us this in summary in Matthew 22:37-40: 'You shall love the Lord your God with all your heart and with all your soul and with all your mind. This is the great and first commandment. And a second is like it: You shall love your neighbor as yourself. On these two commandments depend all the Law and the Prophets.'", refs: ["Deut. 6:5", "Lev. 19:18", "Matt. 22:37-40", "Luke 10:27"] },
  { n: 5, ld: 2, q: "Can you live up to all this perfectly?", a: "No. I have a natural tendency to hate God and my neighbor.", refs: ["Rom. 3:9-20", "Rom. 7:23-24", "Titus 3:3"] },
  // LORD'S DAY 3
  { n: 6, ld: 3, q: "Did God create people so wicked and perverse?", a: "No. God created them good and in his own image, that is, in true righteousness and holiness, so that they might truly know God their creator, love him with all their heart, and live with God in eternal happiness, to praise and glorify him.", refs: ["Gen. 1:31", "Gen. 1:26-27", "Eph. 4:24", "Col. 3:10"] },
  { n: 7, ld: 3, q: "Then where does this corrupt human nature come from?", a: "From the fall and disobedience of our first parents, Adam and Eve, in Paradise. This fall has so poisoned our nature that we are born sinners—corrupt from conception on.", refs: ["Gen. 3", "Rom. 5:12-18", "Ps. 51:5"] },
  // LORD'S DAY 4
  { n: 8, ld: 4, q: "But are we so corrupt that we are totally unable to do any good and inclined toward all evil?", a: "Yes, unless we are born again by the Spirit of God.", refs: ["Gen. 6:5", "Job 14:4", "Isa. 53:6", "John 3:3-5"] },
  { n: 9, ld: 4, q: "But doesn't God do us an injustice by requiring in his law what we are unable to do?", a: "No, God created humans with the ability to keep the law. They, however, provoked by the devil, in reckless disobedience, robbed themselves and all their descendants of these gifts.", refs: ["Gen. 1:31", "Eph. 4:24", "Rom. 5:12"] },
  { n: 10, ld: 4, q: "Does God permit such disobedience and rebellion to go unpunished?", a: "Certainly not. God is terribly angry about the sin we are born with as well as the sins we personally commit. As a just judge, God will punish them both now and in eternity, having declared: 'Cursed is everyone who does not observe and obey all the things written in the book of the law.'", refs: ["Ps. 5:4-6", "Nah. 1:2", "Rom. 1:18", "Eph. 5:6", "Heb. 9:27", "Gal. 3:10", "Deut. 27:26"] },
  { n: 11, ld: 4, q: "But isn't God also merciful?", a: "God is certainly merciful, but also just. His justice demands that sin, committed against his supreme majesty, be punished with the supreme penalty—eternal punishment of body and soul.", refs: ["Exod. 20:6", "Exod. 34:6-7", "Ps. 103:8-9", "Exod. 23:7", "Nah. 1:2-3", "Matt. 25:35-36,45-46"] },
  // LORD'S DAY 5
  { n: 12, ld: 5, q: "According to God's righteous judgment we deserve punishment both in this world and forever after: how then can we escape this punishment and return to God's favor?", a: "God requires that his justice be satisfied. Therefore the claims of his justice must be paid in full, either by ourselves or another.", refs: ["Exod. 23:7", "Rom. 2:1-11"] },
  { n: 13, ld: 5, q: "Can we pay this debt ourselves?", a: "Certainly not. Actually, we increase our guilt every day.", refs: ["Matt. 6:12", "Rom. 2:4-5"] },
  { n: 14, ld: 5, q: "Can another creature—any at all—pay this debt for us?", a: "No. To begin with, God will not punish another creature for what a human is guilty of. Besides, no mere creature can bear the weight of God's eternal anger against sin and release others from it.", refs: ["Heb. 2:14-18", "Ps. 49:7-9", "Isa. 53:11"] },
  { n: 15, ld: 5, q: "What kind of mediator and deliverer should we look for?", a: "One who is truly human and therefore able to bear the weakness of our flesh, and yet more powerful than all creatures, that is, one who is also truly God and therefore able to bear—because of his divine nature—the weight of God's anger and restore us to righteousness and life.", refs: ["1 Cor. 15:21", "Heb. 2:17", "Isa. 7:14", "Isa. 9:6", "Jer. 23:6", "John 1:1", "Rom. 8:3-4"] },
  // LORD'S DAY 6
  { n: 16, ld: 6, q: "Why must the mediator be truly human and truly righteous?", a: "God's justice demands that human nature, which has sinned, must pay for its sin; but a sinner could not pay for others.", refs: ["Rom. 5:12-15", "1 Cor. 15:21", "Heb. 2:14-16", "1 Pet. 3:18"] },
  { n: 17, ld: 6, q: "Why must the mediator also be truly God?", a: "So that, by the power of his divinity, he might bear the weight of God's anger in his humanity and earn for us and restore to us righteousness and life.", refs: ["Isa. 53:8", "Acts 2:24", "2 Cor. 5:21"] },
  { n: 18, ld: 6, q: "And who is this mediator—truly God and at the same time truly human and truly righteous?", a: "Our Lord Jesus Christ, who was given us to set us free and to make us right with God.", refs: ["Matt. 1:21-23", "Luke 2:11", "1 Tim. 2:5", "1 Cor. 1:30"] },
  { n: 19, ld: 6, q: "How do you come to know this?", a: "The holy gospel tells me. God himself began to reveal the gospel already in Paradise; later, he proclaimed it by the holy patriarchs and prophets, and portrayed it by the sacrifices and other ceremonies of the law; and finally, he fulfilled it through his own dear Son.", refs: ["Gen. 3:15", "Gen. 22:18", "Isa. 53", "John 5:46", "Heb. 1:1-2", "Heb. 10:1-10", "Gal. 4:4-5"] },
  // LORD'S DAY 7
  { n: 20, ld: 7, q: "Are all people saved through Christ just as they were lost through Adam?", a: "No. Only those are saved who through true faith are grafted into Christ and accept all his blessings.", refs: ["Matt. 7:14", "John 3:16-18,36", "Rom. 11:16-21"] },
  { n: 21, ld: 7, q: "What is true faith?", a: "True faith is not only a knowledge and conviction that everything God reveals in his Word is true; it is also a deep-rooted assurance, created in me by the Holy Spirit through the gospel, that, out of sheer grace earned for us by Christ, not only others, but I too, have had my sins forgiven, have been made forever right with God, and have been granted salvation.", refs: ["Jas. 2:19", "Matt. 16:15-17", "John 6:68-69", "Rom. 4:18-21", "Rom. 5:1", "Rom. 10:10", "Heb. 4:16", "Eph. 2:8-10"] },
  { n: 22, ld: 7, q: "What then must a Christian believe?", a: "Everything God promises us in the gospel. That gospel is summarized in the articles of our Christian faith—a creed beyond doubt, and confessed throughout the world.", refs: ["Matt. 28:18-20", "John 20:30-31"] },
  { n: 23, ld: 7, q: "What are these articles?", a: "I believe in God, the Father almighty, creator of heaven and earth. I believe in Jesus Christ, his only begotten Son, our Lord, who was conceived by the Holy Spirit and born of the virgin Mary. He suffered under Pontius Pilate, was crucified, died, and was buried; he descended to hell. The third day he rose again from the dead. He ascended to heaven and is seated at the right hand of God the Father almighty. From there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic church, the communion of saints, the forgiveness of sins, the resurrection of the body, and the life everlasting. Amen.", refs: ["The Apostles' Creed"] },
  // LORD'S DAY 8
  { n: 24, ld: 8, q: "How are these articles divided?", a: "Into three parts: God the Father and our creation; God the Son and our deliverance; and God the Holy Spirit and our sanctification.", refs: ["Matt. 28:19", "1 Pet. 1:2"] },
  { n: 25, ld: 8, q: "Since there is but one God, why do you speak of three: Father, Son, and Holy Spirit?", a: "Because that is how God has revealed himself in his Word: these three distinct persons are one, true, eternal God.", refs: ["Deut. 6:4", "Isa. 44:6", "1 Cor. 8:4,6", "Matt. 3:16-17", "Matt. 28:19", "2 Cor. 13:14", "1 John 5:7"] },
  // LORD'S DAY 9
  { n: 26, ld: 9, q: "What do you believe when you say, 'I believe in God, the Father almighty, creator of heaven and earth'?", a: "That the eternal Father of our Lord Jesus Christ, who out of nothing created heaven and earth and everything in them, who still upholds and rules them by his eternal counsel and providence, is my God and Father because of Christ his Son. I trust him so much that I do not doubt he will provide whatever I need for body and soul, and he will turn to my good whatever adversity he sends me in this sad world. He is able to do this because he is almighty God; he desires to do this because he is a faithful Father.", refs: ["Gen. 1-2", "Exod. 20:11", "Ps. 104", "Matt. 6:25-34", "Rom. 8:15-16", "Eph. 1:5", "Heb. 1:3"] },
  // LORD'S DAY 10
  { n: 27, ld: 10, q: "What do you understand by the providence of God?", a: "Providence is the almighty and ever present power of God by which he upholds, as with his hand, heaven and earth and all creatures, and so rules them that leaf and blade, rain and drought, fruitful and lean years, food and drink, health and sickness, prosperity and poverty—all things, in fact, come to us not by chance but from his fatherly hand.", refs: ["Jer. 23:23-24", "Acts 17:24-28", "Heb. 1:3", "Jer. 5:24", "Acts 14:15-17", "John 9:3", "Prov. 22:2"] },
  { n: 28, ld: 10, q: "How does the knowledge of God's creation and providence help us?", a: "We can be patient when things go against us, thankful when things go well, and for the future we can have good confidence in our faithful God and Father that nothing will separate us from his love. All creatures are so completely in his hand that without his will they can neither move nor be moved.", refs: ["Job 1:21-22", "Jas. 1:3", "Deut. 8:10", "1 Thess. 5:18", "Rom. 5:3-5", "Rom. 8:38-39", "Job 1:12", "Acts 17:25-28", "Prov. 21:1"] },
  // LORD'S DAY 11
  { n: 29, ld: 11, q: "Why is the Son of God called 'Jesus,' meaning 'savior'?", a: "Because he saves us from our sins. Salvation cannot be found in anyone else; it is futile to look for any salvation elsewhere.", refs: ["Matt. 1:21", "Heb. 7:25", "Acts 4:11-12"] },
  { n: 30, ld: 11, q: "Do those who look for their salvation and security in saints, in themselves, or elsewhere, really believe in the only savior Jesus?", a: "No. Although they boast of being his, by their deeds they deny the only savior and deliverer, Jesus. Either Jesus is not a perfect savior, or those who in true faith accept this savior have in him all they need for their salvation.", refs: ["1 Cor. 1:12-13,30-31", "Gal. 5:4", "Col. 1:19-20"] },
  // LORD'S DAY 12
  { n: 31, ld: 12, q: "Why is he called 'Christ,' meaning 'anointed'?", a: "Because he has been ordained by God the Father and has been anointed with the Holy Spirit to be our chief prophet and teacher who perfectly reveals to us the secret counsel and will of God for our deliverance; our only high priest who has set us free by the one sacrifice of his body, and who continually pleads our cause with the Father; and our eternal king who governs us by his Word and Spirit, and who guards us and keeps us in the freedom he has won for us.", refs: ["Luke 3:21-22", "Ps. 2:6", "Heb. 5:9-10", "Ps. 110:4", "Acts 3:22", "Deut. 18:15", "John 15:15", "Heb. 9:12", "Heb. 10:11-14"] },
  { n: 32, ld: 12, q: "But why are you called a Christian?", a: "Because by faith I am a member of Christ and so I share in his anointing. I am anointed to confess his name, to present myself to him as a living sacrifice of thanks, to strive with a good conscience against sin and the devil in this life, and afterward to reign with Christ over all creation for all eternity.", refs: ["Acts 11:26", "1 John 2:27", "1 Pet. 2:5,9", "Rom. 12:1", "Rev. 1:6", "Rev. 5:9-10"] },
  // LORD'S DAY 13
  { n: 33, ld: 13, q: "Why is he called God's 'only begotten Son' when we also are God's children?", a: "Because Christ alone is the eternal, natural Son of God. We, however, are adopted children of God—adopted by grace through Christ.", refs: ["John 1:1-3,14,18", "Heb. 1", "John 1:12-13", "Rom. 8:14-17", "Eph. 1:5-6"] },
  { n: 34, ld: 13, q: "Why do you call him 'our Lord'?", a: "Because—not with gold or silver, but with his precious blood—he has set us free from sin and from the tyranny of the devil, and has bought us, body and soul, to be his very own.", refs: ["1 Pet. 1:18-19", "1 Cor. 6:20", "1 Tim. 2:5-6"] },
  // LORD'S DAY 14
  { n: 35, ld: 14, q: "What does it mean that he 'was conceived by the Holy Spirit and born of the virgin Mary'?", a: "That the eternal Son of God, who is and remains true and eternal God, took to himself, through the working of the Holy Spirit, from the flesh and blood of the virgin Mary, a truly human nature so that he might become David's true descendant, like his brothers and sisters in every way except for sin.", refs: ["John 1:1", "Matt. 1:18-23", "Luke 1:35", "2 Sam. 7:12-16", "Ps. 132:11", "Rom. 1:3", "Gal. 4:4", "Heb. 2:17", "Heb. 4:15"] },
  { n: 36, ld: 14, q: "How does the holy conception and birth of Christ benefit you?", a: "He is our mediator, and with his innocence and perfect holiness he removes from God's sight my sin—mine since I was conceived.", refs: ["Heb. 7:26-27", "Ps. 32:1", "1 Cor. 15:21-22", "Rom. 8:3-4"] },
  // LORD'S DAY 15
  { n: 37, ld: 15, q: "What do you understand by the word 'suffered'?", a: "That during his whole life on earth, but especially at the end, Christ sustained in body and soul the anger of God against the sin of the whole human race. This he did in order that, by his suffering as the only atoning sacrifice, he might set us free, body and soul, from eternal condemnation, and gain for us God's grace, righteousness, and eternal life.", refs: ["Isa. 53", "1 Pet. 2:24", "1 Tim. 2:6", "Rom. 3:25-26"] },
  { n: 38, ld: 15, q: "Why did he suffer 'under Pontius Pilate' as his judge?", a: "So that he, though innocent, might be condemned by a civil judge, and so free us from the severe judgment of God that was to fall on us.", refs: ["Luke 23:13-24", "John 19:4", "2 Cor. 5:21", "Gal. 3:13"] },
  { n: 39, ld: 15, q: "Is it significant that he was 'crucified' instead of dying some other way?", a: "Yes. This death convinces me that he shouldered the curse that lay on me, since death by crucifixion was accursed by God.", refs: ["Gal. 3:10-13", "Deut. 21:23"] },
  // LORD'S DAY 16
  { n: 40, ld: 16, q: "Why did Christ have to go all the way to death?", a: "Because God's justice and truth demand it: only the death of God's Son could pay for our sin.", refs: ["Gen. 2:17", "Rom. 5:12-21", "Phil. 2:8", "Heb. 2:9"] },
  { n: 41, ld: 16, q: "Why was he 'buried'?", a: "His burial testifies that he really died.", refs: ["Isa. 53:9", "Matt. 27:59-60", "John 19:38-42", "Acts 13:29", "1 Cor. 15:3-4"] },
  { n: 42, ld: 16, q: "Since Christ has died for us, why do we still have to die?", a: "Our death does not pay the debt of our sins. Rather, it puts an end to our sinning and is our entrance into eternal life.", refs: ["Phil. 1:23", "John 5:24", "Rom. 7:24-25"] },
  { n: 43, ld: 16, q: "What further advantage do we receive from Christ's sacrifice and death on the cross?", a: "Through Christ's death our old selves are crucified, put to death, and buried with him, so that the evil desires of the flesh may no longer rule us, but that instead we may dedicate ourselves as an offering of gratitude to him.", refs: ["Rom. 6:5-11", "Col. 2:11-12", "Gal. 5:24"] },
  { n: 44, ld: 16, q: "Why does the creed add, 'He descended to hell'?", a: "To assure me during attacks of deepest dread and temptation that Christ my Lord, by suffering unspeakable anguish, pain, and terror of soul, on the cross but also earlier, has delivered me from hellish anguish and torment. This is why I no longer need to fear hell.", refs: ["Isa. 53:10", "Matt. 27:46", "Heb. 5:7-10", "Ps. 18:4-6", "Ps. 116:3"] },
  // LORD'S DAY 17
  { n: 45, ld: 17, q: "How does Christ's resurrection benefit us?", a: "First, by his resurrection he has overcome death, so that he might make us share in the righteousness he won for us by his death. Second, by his power we too are already now resurrected to a new life. Third, Christ's resurrection is a guarantee of our glorious resurrection.", refs: ["Rom. 4:25", "1 Cor. 15:16-20", "Rom. 6:5-11", "Eph. 2:4-6", "Col. 3:1-4", "1 Pet. 1:3-5"] },
  // LORD'S DAY 18
  { n: 46, ld: 18, q: "What do you mean by saying, 'He ascended to heaven'?", a: "That Christ, while his disciples watched, was lifted up from the earth into heaven and will be there for our good until he comes again to judge the living and the dead.", refs: ["Acts 1:9-11", "Matt. 28:20", "Heb. 7:23-25", "Heb. 9:24-26"] },
  { n: 47, ld: 18, q: "But isn't Christ with us until the end of the world as he promised us?", a: "Christ is true human and true God. In his human nature Christ is not now on earth; but in his divinity, majesty, grace, and Spirit he is not absent from us for a moment.", refs: ["Matt. 28:20", "John 14:16-19", "John 16:28", "Acts 3:21", "Heb. 8:4"] },
  { n: 48, ld: 18, q: "If his humanity is not present wherever his divinity is, then aren't the two natures of Christ separated from each other?", a: "Certainly not. Since divinity is not limited and is present everywhere, it is evident that Christ's divinity is surely beyond the bounds of the humanity he has taken on, but at the same time his divinity is in and remains personally united to his humanity.", refs: ["John 1:48", "John 3:13", "Col. 2:9"] },
  { n: 49, ld: 18, q: "How does Christ's ascension to heaven benefit us?", a: "First, he pleads our cause in the presence of his Father in heaven. Second, we have our own flesh in heaven—a guarantee that Christ our head will take us, his members, to himself in heaven. Third, he sends his Spirit to us on earth as a further guarantee. By the Spirit's power we make the goal of our lives, not earthly things, but the things above where Christ is, sitting at God's right hand.", refs: ["Rom. 8:34", "1 John 2:1", "John 14:2", "Eph. 2:4-6", "John 14:16", "Acts 2:33", "2 Cor. 5:5", "Col. 3:1-4"] },
  // LORD'S DAY 19
  { n: 50, ld: 19, q: "Why the next words: 'and is seated at the right hand of God'?", a: "Christ ascended to heaven for this reason: that he might show himself there as head of his church, the one through whom the Father rules all things.", refs: ["Eph. 1:20-23", "Col. 1:18", "Matt. 28:18"] },
  { n: 51, ld: 19, q: "How does this glory of Christ our head benefit us?", a: "First, through his Holy Spirit he pours out his gifts on us his members. Second, by his power he defends us and keeps us safe from all enemies.", refs: ["Acts 2:33", "Eph. 4:7-12", "Ps. 110:1-2", "John 10:27-30"] },
  { n: 52, ld: 19, q: "What comfort does the return of Christ 'to judge the living and the dead' give you?", a: "In all my distress and persecution I turn my eyes to the heavens and confidently await as judge the very one who before has stood in my place before God and has removed all cursing from me. All his enemies and mine he will condemn to everlasting punishment: but me and all his chosen ones he will take along with him into the joy and the glory of heaven.", refs: ["Luke 21:28", "Rom. 8:23-25", "Phil. 3:20-21", "Matt. 25:31-46", "2 Thess. 1:6-7"] },
  // LORD'S DAY 20
  { n: 53, ld: 20, q: "What do you believe concerning 'the Holy Spirit'?", a: "First, he, as well as the Father and the Son, is eternal God. Second, he has been given to me personally, so that, by true faith, he makes me share in Christ and all his blessings, comforts me, and remains with me forever.", refs: ["Gen. 1:1-2", "Matt. 28:19", "Acts 5:3-4", "1 Cor. 6:19", "Gal. 4:6", "Acts 2:1-33", "John 14:16-18"] },
  // LORD'S DAY 21
  { n: 54, ld: 21, q: "What do you believe concerning 'the holy catholic church'?", a: "I believe that the Son of God through his Spirit and Word, out of the entire human race, from the beginning of the world to its end, gathers, protects, and preserves for himself a community chosen for eternal life and united in true faith. And of this community I am and always will be a living member.", refs: ["John 10:14-16", "Acts 20:28", "Eph. 1:3-14", "Eph. 4:3-16", "1 Cor. 11:26", "Acts 2:42-47"] },
  { n: 55, ld: 21, q: "What do you understand by 'the communion of saints'?", a: "First, that believers one and all, as members of this community, share in Christ and in all his treasures and gifts. Second, that each member should consider it a duty to use these gifts readily and cheerfully for the service and enrichment of the other members.", refs: ["Rom. 8:32", "1 Cor. 12:4-7,12-13", "1 John 1:3", "1 Cor. 13"] },
  { n: 56, ld: 21, q: "What do you believe concerning 'the forgiveness of sins'?", a: "I believe that God, because of Christ's atonement, will never hold against me any of my sins nor my sinful nature which I need to struggle against all my life. Rather, by grace God grants me the righteousness of Christ to free me forever from judgment.", refs: ["Ps. 103:3-4,10,12", "Mic. 7:18-19", "2 Cor. 5:18-21", "1 John 2:2", "Rom. 7:23-25"] },
  // LORD'S DAY 22
  { n: 57, ld: 22, q: "How does 'the resurrection of the body' comfort you?", a: "Not only my soul will be taken immediately after this life to Christ its head, but even my very flesh, raised by the power of Christ, will be reunited with my soul and made like Christ's glorious body.", refs: ["1 Cor. 15:20,42-46,54", "Job 19:25-26", "Phil. 3:21", "1 Thess. 4:13-18"] },
  { n: 58, ld: 22, q: "How does the article concerning 'life everlasting' comfort you?", a: "Even as I already now experience in my heart the beginning of eternal joy, so after this life I will have perfect blessedness such as no eye has seen, no ear has heard, no human heart has ever imagined—a blessedness in which to praise God eternally.", refs: ["John 17:3", "Rom. 14:17", "2 Cor. 5:2-3", "1 John 3:2", "1 Cor. 2:9"] },
  // LORD'S DAY 23
  { n: 59, ld: 23, q: "What good does it do you, however, to believe all this?", a: "In Christ I am right with God and heir to life everlasting.", refs: ["Hab. 2:4", "John 3:36", "Rom. 1:17", "Gal. 3:11"] },
  { n: 60, ld: 23, q: "How are you right with God?", a: "Only by true faith in Jesus Christ. Even though my conscience accuses me of having grievously sinned against all God's commandments and of never having kept any of them, and even though I am still inclined toward all evil, nevertheless, without my deserving it at all, out of sheer grace, God grants and credits to me the perfect satisfaction, righteousness, and holiness of Christ, as if I had never sinned nor been a sinner, as if I had been as perfectly obedient as Christ was obedient for me. All I need to do is to accept this gift of God with a believing heart.", refs: ["Rom. 3:21-28", "Gal. 2:16", "Eph. 2:8-9", "Phil. 3:8-11", "Rom. 4:1-8", "2 Cor. 5:17-19"] },
  { n: 61, ld: 23, q: "Why do you say that by faith alone you are right with God?", a: "It is not because of any value my faith has that God is pleased with me. Only Christ's satisfaction, righteousness, and holiness make me right with God. And I can receive this righteousness and make it mine in no other way than by faith alone.", refs: ["1 Cor. 1:30-31", "Rom. 10:10", "1 John 5:10-12"] },
  // LORD'S DAY 24
  { n: 62, ld: 24, q: "Why can't the good we do make us right with God, or at least help make us right with him?", a: "Because the righteousness which can pass God's scrutiny must be entirely perfect and must in every way measure up to the divine law. Even the very best we do in this life is imperfect and stained with sin.", refs: ["Gal. 3:10", "Deut. 27:26", "Jas. 2:10", "Isa. 64:6"] },
  { n: 63, ld: 24, q: "How can you say that the good we do doesn't earn anything when God promises to reward it in this life and the next?", a: "This reward is not earned; it is a gift of grace.", refs: ["Matt. 5:12", "Luke 17:10", "2 Tim. 4:7-8"] },
  { n: 64, ld: 24, q: "But doesn't this teaching make people indifferent and wicked?", a: "No. It is impossible for those grafted into Christ by true faith not to produce fruits of gratitude.", refs: ["Rom. 6:1-2", "Jas. 2:17", "Luke 6:43-45", "John 15:5"] },
  // LORD'S DAY 25
  { n: 65, ld: 25, q: "It is by faith alone that we share in Christ and all his mercies: where then does that faith come from?", a: "The Holy Spirit produces it in our hearts by the preaching of the holy gospel, and confirms it through our use of the holy sacraments.", refs: ["John 3:5", "1 Cor. 2:10-14", "Eph. 2:8", "Phil. 1:29", "Rom. 10:17", "1 Pet. 1:23", "Matt. 28:19-20", "1 Cor. 10:16"] },
  // LORD'S DAY 26
  { n: 66, ld: 26, q: "What are sacraments?", a: "Sacraments are holy signs and seals for us to see. They were instituted by God so that by our use of them he might make us understand more clearly the promise of the gospel, and might put his seal on that promise. And this is God's gospel promise: to forgive our sins and give us eternal life, by grace alone, because of Christ's one sacrifice finished on the cross.", refs: ["Gen. 17:11", "Deut. 30:6", "Rom. 4:11", "Matt. 26:27-28", "Heb. 10:10"] },
  { n: 67, ld: 26, q: "Are both the Word and the sacraments then intended to focus our faith on the sacrifice of Jesus Christ on the cross as the only ground of our salvation?", a: "Right! In the gospel the Holy Spirit teaches us and through the holy sacraments he assures us that our entire salvation rests on Christ's one sacrifice for us on the cross.", refs: ["Rom. 6:3\u20134", "1 Cor. 11:26", "Gal. 3:27"] },
  { n: 68, ld: 26, q: "How many sacraments did Christ institute in the New Testament?", a: "Two: holy baptism and the holy supper.", refs: ["Matt. 28:19-20", "1 Cor. 11:23-26"] },
  // LORD'S DAY 27
  { n: 69, ld: 27, q: "How does holy baptism remind you and assure you that Christ's one sacrifice on the cross is for you personally?", a: "In this way: Christ instituted this outward washing and with it gave the promise that, as surely as water washes away the dirt from the body, so certainly his blood and his Spirit wash away my soul's impurity, in other words, all my sins.", refs: ["Matt. 3:11", "Mark 1:4", "John 1:33", "Acts 2:38", "Rom. 6:3-4"] },
  { n: 70, ld: 27, q: "What does it mean to be washed with Christ's blood and Spirit?", a: "To be washed with Christ's blood means that God, by grace, has forgiven my sins because of Christ's blood poured out for me in his sacrifice on the cross. To be washed with Christ's Spirit means that the Holy Spirit has renewed me and set me apart to be a member of Christ so that more and more I become dead to sin and increasingly live a holy and blameless life.", refs: ["Zech. 13:1", "Eph. 1:7", "Heb. 12:24", "1 Pet. 1:2", "Rev. 1:5", "Ezek. 36:25-27", "John 3:5-8", "Rom. 6:4", "1 Cor. 6:11", "Col. 2:11-12"] },
  { n: 71, ld: 27, q: "Where does Christ promise that we are washed with his blood and Spirit as surely as we are washed with the water of baptism?", a: "In the institution of baptism, where he says: 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.' 'Whoever believes and is baptized will be saved, but whoever does not believe will be condemned.' This promise is repeated when Scripture calls baptism the washing of rebirth and the washing away of sins.", refs: ["Matt. 28:19", "Mark 16:16", "Titus 3:5", "Acts 22:16"] },
  // LORD'S DAY 28
  { n: 72, ld: 28, q: "Does this outward washing with water itself wash away sins?", a: "No, only Jesus Christ's blood and the Holy Spirit cleanse us from all sins.", refs: ["Matt. 3:11", "1 Pet. 3:21", "1 John 1:7"] },
  { n: 73, ld: 28, q: "Why then does the Holy Spirit call baptism the washing of regeneration and the washing away of sins?", a: "God has good reason for these words. He wants to teach us that the blood and Spirit of Christ wash away our sins just as water washes away dirt from the body. But more important, he wants to assure us, by this divine pledge and sign, that the washing away of our sins spiritually is as real as physical washing with water.", refs: ["Acts 2:38\u201339", "Acts 22:16", "Rom. 6:3-4", "Gal. 3:27"] },
  // LORD'S DAY 29
  { n: 74, ld: 29, q: "Should infants also be baptized?", a: "Yes. Infants as well as adults are in God's covenant and are his people. They, no less than adults, are promised the forgiveness of sin through Christ's blood and the Holy Spirit who produces faith. Therefore, by baptism, the mark of the covenant, infants should be received into the Christian church and should be distinguished from the children of unbelievers. This was done in the Old Testament by circumcision, which was replaced in the New Testament by baptism.", refs: ["Gen. 17:7", "Matt. 19:14", "Acts 2:38-39", "Acts 10:47", "1 Cor. 7:14", "Col. 2:11-13"] },
  // LORD'S DAY 30
  { n: 75, ld: 30, q: "How does the holy supper remind you and assure you that you share in Christ's one sacrifice on the cross and in all his gifts?", a: "In this way: Christ has commanded me and all believers to eat this broken bread and to drink this cup. With this command he gave this promise: As surely as I see with my eyes the bread of the Lord broken for me and the cup given to me, so surely his body was offered and broken for me and his blood was poured out for me on the cross. As surely as I receive from the hand of the one who serves, and taste with my mouth the bread and cup of the Lord, given to me as sure signs of Christ's body and blood, so surely he nourishes and refreshes my soul for eternal life with his crucified body and poured-out blood.", refs: ["Matt. 26:26-28", "Mark 14:22-24", "Luke 22:19-20", "1 Cor. 10:16-17", "1 Cor. 11:23-26"] },
  { n: 76, ld: 30, q: "What does it mean to eat the crucified body of Christ and to drink his poured-out blood?", a: "It means to accept with a believing heart the entire suffering and death of Christ and thereby to receive forgiveness of sins and eternal life. But it means more. Through the Holy Spirit, who lives both in Christ and in us, we are united more and more to Christ's blessed body. And so, although he is in heaven and we are on earth, we are flesh of his flesh and bone of his bone. And we forever live on and are governed by one Spirit, as the members of our body are by one soul.", refs: ["John 6:35,40,51", "Rom. 8:9-11", "1 Cor. 6:17", "Eph. 3:16-17", "Eph. 5:29-30", "1 John 4:13"] },
  { n: 77, ld: 30, q: "Where has Christ promised that he will nourish and refresh believers with his body and blood as surely as they eat this broken bread and drink this cup?", a: "In the institution of the Lord's Supper: 'The Lord Jesus on the night when he was betrayed took a loaf of bread, and when he had given thanks, he broke it and said, This is my body that is for you. Do this in remembrance of me. In the same way he took the cup also, after supper, saying, This cup is the new covenant in my blood. Do this, as often as you drink it, in remembrance of me. For as often as you eat this bread and drink the cup, you proclaim the Lord's death until he comes.' This promise is repeated by Paul: 'The cup of blessing that we bless, is it not a sharing in the blood of Christ? The bread that we break, is it not a sharing in the body of Christ?'", refs: ["1 Cor. 10:16-17", "1 Cor. 11:23-26"] },
  // LORD'S DAY 31
  { n: 78, ld: 31, q: "Are the bread and wine changed into the real body and blood of Christ?", a: "No. Just as the water of baptism is not changed into Christ's blood and does not itself wash away sins but is simply God's sign and assurance, so too the bread of the Lord's Supper is not changed into the actual body of Christ even though it is called the body of Christ in keeping with the nature and language of sacraments.", refs: ["Matt. 26:26-29", "1 Cor. 10:16-17", "1 Cor. 11:26-28"] },
  { n: 79, ld: 31, q: "Why then does Christ call the bread his body and the cup his blood, or the new covenant in his blood? (Paul uses the words, a participation in Christ's body and blood.)", a: "Christ has good reason for these words. He wants to teach us that as bread and wine nourish the temporal life, so too his crucified body and poured-out blood truly nourish our souls for eternal life. But more important, he wants to assure us, by this visible sign and pledge, that we, through the Holy Spirit's work, share in his true body and blood as surely as our mouths receive these holy signs in his remembrance, and that all of his suffering and obedience are as definitely ours as if we personally had suffered and paid for our sins.", refs: ["John 6:51,55", "1 Cor. 10:16-17", "Rom. 6:5", "1 Cor. 11:26"] },
  // LORD'S DAY 32
  { n: 80, ld: 32, q: "How does the Lord's Supper differ from the Roman Catholic Mass?", a: "The Lord's Supper declares to us that our sins have been completely forgiven through the one sacrifice of Jesus Christ which he himself finished on the cross once and for all. It also declares to us that the Holy Spirit grafts us into Christ, who with his very body is now in heaven at the right hand of the Father where he wants us to worship him. But the Mass teaches that the living and the dead do not have their sins forgiven through the suffering of Christ unless Christ is still offered for them daily by the priests. It also teaches that Christ is bodily present in the form of bread and wine where Christ is therefore to be worshiped. Thus the Mass is basically nothing but a denial of the one sacrifice and suffering of Jesus Christ and a condemnable idolatry.", refs: ["Matt. 26:28", "John 19:30", "Heb. 7:27", "Heb. 9:12,25-26", "Heb. 10:10-18"] },
  { n: 81, ld: 32, q: "Who are to come to the Lord's table?", a: "Those who are displeased with themselves because of their sins, but who nevertheless trust that their sins are pardoned and that their continuing weakness is covered by the suffering and death of Christ, and who also desire more and more to strengthen their faith and to lead a better life. Hypocrites and those who are unrepentant, however, eat and drink judgment on themselves.", refs: ["1 Cor. 10:19-22", "1 Cor. 11:26-32"] },
  { n: 82, ld: 32, q: "Are those also to be admitted to the Lord's Supper who show by what they profess and how they live that they are unbelieving and ungodly?", a: "No, that would dishonor God's covenant and bring down God's anger upon the entire congregation. Therefore, according to the instruction of Christ and his apostles, the Christian church is duty-bound to exclude such people, by the official use of the keys of the kingdom, until they reform their lives.", refs: ["Ps. 50:16", "Isa. 1:11-17", "1 Cor. 11:17-34", "Matt. 18:15-18", "2 Thess. 3:6"] },
  // LORD'S DAY 33
  { n: 83, ld: 33, q: "What are the keys of the kingdom?", a: "The preaching of the holy gospel and Christian discipline toward repentance. Both preaching and Christian discipline open the kingdom of heaven to believers and close it to unbelievers.", refs: ["Matt. 16:19", "John 20:22-23"] },
  { n: 84, ld: 33, q: "How does preaching the holy gospel open and close the kingdom of heaven?", a: "According to the command of Christ: The kingdom of heaven is opened by proclaiming and publicly declaring to each and every believer that, as often as he accepts the gospel promise in true faith, God, because of what Christ has done, has truly forgiven all his sins. The kingdom of heaven is closed, however, by proclaiming and publicly declaring to unbelievers and hypocrites that, as long as they do not repent, the anger of God and eternal condemnation rest on them. God's judgment, both in this life and in the life to come, is based on this gospel testimony.", refs: ["Matt. 16:19", "John 3:31-36", "John 20:21-23", "2 Cor. 2:14-16"] },
  { n: 85, ld: 33, q: "How is the kingdom of heaven closed and opened by Christian discipline?", a: "According to the command of Christ: If anyone, though called a Christian, professes unchristian teachings or lives an unchristian life, if after repeated and loving counsel, he refuses to abandon his errors and wickedness, and if after being reported to the church, that is, its officers, he fails to respond also to their counsel, he is excluded from the Christian fellowship by lack of admission to the sacraments, and God himself excludes him from the kingdom of Christ. Such a person, when he promises and demonstrates genuine reform, is received back as a member of Christ and of his church.", refs: ["Matt. 18:15-20", "1 Cor. 5:3-5,11-13", "2 Thess. 3:14-15", "2 John 10-11"] },
  // LORD'S DAY 34
  { n: 86, ld: 34, q: "Since we have been delivered from our misery by grace through Christ without any merit of our own, why then should we still do good?", a: "To be sure, Christ has redeemed us by his blood. But we do good because Christ by his Spirit is also renewing us to be like himself, so that in all our living we may show that we are thankful to God for all he has done for us, and so that he may be praised through us. And we do good so that we may be assured of our faith by its fruits, and so that by our godly living our neighbors may be won over to Christ.", refs: ["Rom. 6:13", "Rom. 12:1-2", "1 Pet. 2:5-10", "Matt. 5:16", "1 Cor. 6:19-20", "1 Tim. 6:17-18", "Jas. 2:14-26"] },
  { n: 87, ld: 34, q: "Can those be saved who do not turn to God from their ungrateful and impenitent ways?", a: "By no means. Scripture tells us that no unchaste person, no idolater, adulterer, thief, no covetous person, no drunkard, slanderer, robber, or the like is going to inherit the kingdom of God.", refs: ["1 Cor. 6:9-10", "Gal. 5:19-21", "Eph. 5:5-6", "1 John 3:14"] },
  { n: 88, ld: 34, q: "What is involved in genuine repentance or conversion?", a: "Two things: the dying-away of the old self, and the rising-to-life of the new.", refs: ["Rom. 6:1-11", "2 Cor. 5:17", "Eph. 4:22-24", "Col. 3:5-10"] },
  // LORD'S DAY 35
  { n: 89, ld: 35, q: "What is the dying-away of the old self?", a: "It is to be genuinely sorry for sin, to hate it more and more, and to run away from it.", refs: ["Ps. 51:3-4,17", "Joel 2:12-13", "Rom. 8:13", "2 Cor. 7:10"] },
  { n: 90, ld: 35, q: "What is the rising-to-life of the new self?", a: "It is wholehearted joy in God through Christ and a strong desire to live according to the will of God by doing every kind of good work.", refs: ["Ps. 51:8,12", "Isa. 57:15", "Rom. 5:1", "Rom. 14:17", "Gal. 2:20"] },
  { n: 91, ld: 35, q: "What do we do that is good?", a: "Only that which arises out of true faith, conforms to God's law, and is done for his glory; and not that which is based on what we think is right or on established human tradition.", refs: ["John 15:5", "Rom. 14:23", "Heb. 11:6", "Lev. 18:4", "1 Sam. 15:22", "Eph. 2:10", "1 Cor. 10:31"] },
  // LORD'S DAY 36 (Ten Commandments)
  { n: 92, ld: 36, q: "What is God's law?", a: "God spoke all these words: 'I am the Lord your God, who brought you out of Egypt, out of the land of slavery. You shall have no other gods before me...' [The full text of the Decalogue, Exod. 20:1-17 / Deut. 5:6-21].", refs: ["Exod. 20:1-17", "Deut. 5:6-21"] },
  { n: 93, ld: 36, q: "How are these commandments divided?", a: "Into two tables. The first has four commandments, teaching us what our relation to God should be. The second has six commandments, teaching us what we owe our neighbor.", refs: ["Matt. 22:37-40", "Deut. 4:13"] },
  { n: 94, ld: 36, q: "What does the Lord require in the first commandment?", a: "That I, not wanting to endanger my very salvation, avoid and shun all idolatry, magic, superstitious rites, and prayer to saints or to other creatures. That I sincerely acknowledge the only true God, trust him alone, look to him for every good thing humbly and patiently, love him, fear him, and honor him with all my heart. In short, that I give up anything rather than go against his will in any way.", refs: ["1 Cor. 6:9-10", "1 Cor. 10:5-14", "1 John 5:21", "Deut. 6:4-5", "Matt. 4:10", "Rev. 19:10", "Deut. 10:20"] },
  { n: 95, ld: 36, q: "What is idolatry?", a: "Idolatry is having or inventing something in which one trusts in place of or alongside of the only true God, who has revealed himself in the Word.", refs: ["1 Chron. 16:26", "Gal. 4:8-9", "Eph. 5:5", "Phil. 3:19"] },
  // LORD'S DAY 37
  { n: 96, ld: 37, q: "What is God's will for us in the second commandment?", a: "That we in no way make any image of God nor worship him in any other way than has been commanded in God's Word.", refs: ["Deut. 4:15-19", "Isa. 40:18-25", "Acts 17:29", "Rom. 1:22-23", "1 Sam. 15:23", "Deut. 12:30", "Matt. 15:9"] },
  { n: 97, ld: 37, q: "May we then not make any image at all?", a: "God cannot and may not be visibly portrayed in any way. Although creatures may be portrayed, yet God forbids making or having such images if one's intention is to worship them or to serve God through them.", refs: ["Exod. 23:24-25", "Exod. 34:13-14", "Deut. 7:5", "Deut. 12:3", "Deut. 16:22"] },
  { n: 98, ld: 37, q: "But may not images be permitted in churches in place of books for the unlearned?", a: "No, we shouldn't try to be wiser than God. He wants the Christian community instructed by the living preaching of his Word— not by idols that cannot even talk.", refs: ["Jer. 10:8", "Hab. 2:18-20", "Rom. 10:14-15", "2 Tim. 3:16-17", "2 Pet. 1:19"] },
  // LORD'S DAY 38
  { n: 99, ld: 38, q: "What is God's will for us in the third commandment?", a: "That we neither blaspheme nor misuse the name of God by cursing, perjury, or unnecessary oaths, nor share in such horrible sins by being silent bystanders. In a word, it requires that we use the holy name of God only with reverence and awe, so that we may properly confess him, pray to him, and praise him in everything we do and say.", refs: ["Lev. 24:10-17", "Lev. 19:12", "Matt. 5:37", "Jas. 5:12", "Ps. 99:1-5", "Jer. 4:2", "Matt. 10:32-33"] },
  { n: 100, ld: 38, q: "Is blasphemy of God's name by swearing and cursing really such serious sin that God is angry also with those who do not do all they can to help prevent and forbid it?", a: "Yes, indeed. No sin is greater, no sin makes God more angry than blaspheming his name. That is why he commanded it to be punished with death.", refs: ["Lev. 5:1", "Lev. 24:10-17", "Prov. 29:24"] },
  // LORD'S DAY 39
  { n: 101, ld: 39, q: "But may we swear an oath in God's name if we do it reverently?", a: "Yes, when the government demands it, or when necessity requires it, in order to maintain and promote truth and trustworthiness for God's glory and our neighbor's good. Such oaths are approved in God's Word and were rightly used by Old and New Testament believers.", refs: ["Deut. 6:13", "Deut. 10:20", "Gen. 21:24", "Gen. 31:53", "Josh. 9:15,19", "1 Sam. 24:22", "1 Kings 1:29-30", "Ezra 10:5", "Neh. 13:25", "Rom. 1:9", "2 Cor. 1:23", "Heb. 6:16"] },
  { n: 102, ld: 39, q: "May we also swear by saints or by other creatures?", a: "No. A legitimate oath means calling upon God as the one who knows my heart to witness to my truthfulness and to punish me if I swear falsely. No creature is worthy of such honor.", refs: ["Matt. 5:34-37", "Matt. 23:16-22", "Jas. 5:12"] },
  // LORD'S DAY 40
  { n: 103, ld: 40, q: "What is God's will for you in the fourth commandment?", a: "First, that the gospel ministry and education for it be maintained, and that, especially on the festive day of rest, I regularly attend the assembly of God's people to learn what God's Word teaches, to participate in the sacraments, to pray to God publicly, and to bring Christian offerings for the poor. Second, that every day of my life I rest from my evil ways, let the Lord work in me through his Spirit, and so begin already in this life the eternal Sabbath.", refs: ["Deut. 6:4-9", "Deut. 6:20-25", "Ps. 68:26", "Acts 2:42-47", "Acts 20:7", "1 Cor. 16:1-2", "Titus 1:5", "2 Tim. 2:2", "Isa. 66:23", "Heb. 10:23-25", "Isa. 58:13-14", "1 Cor. 16:1-2"] },
  // LORD'S DAY 41
  { n: 104, ld: 41, q: "What is God's will for you in the fifth commandment?", a: "That I honor, love, and be loyal to my father and mother and all those in authority over me; that I obey and submit to them, as is proper, when they correct and punish me; and also that I be patient with their failings— for through them God chooses to rule us.", refs: ["Exod. 21:17", "Prov. 1:8", "Prov. 4:1", "Rom. 13:1-2", "Eph. 5:21-22", "Eph. 6:1-9", "Col. 3:18-24", "Prov. 20:20", "Matt. 15:4-9"] },
  // LORD'S DAY 42
  { n: 105, ld: 42, q: "What is God's will for you in the sixth commandment?", a: "I am not to belittle, insult, hate, or kill my neighbor— not by my thoughts, my words, my look or gesture, and certainly not by actual deeds— and I am not to be party to this in others; rather, I am to put away all desire for revenge. I am not to harm or recklessly endanger myself either. Prevention of murder is also why government is armed with the sword.", refs: ["Gen. 9:6", "Matt. 5:21-22", "Matt. 26:52", "Rom. 1:29", "Jas. 1:20", "Jas. 4:1-2", "Gal. 5:19-21", "Lev. 19:17-18", "Matt. 5:43-45", "Eph. 4:26", "Rom. 13:4"] },
  // LORD'S DAY 43
  { n: 106, ld: 43, q: "But this commandment seems to be only about murder?", a: "By forbidding murder God teaches us that he hates the root of murder: envy, hatred, anger, vindictiveness. In God's sight all such are murder.", refs: ["Prov. 14:30", "Rom. 1:29", "Rom. 12:19", "Jas. 1:20", "1 John 2:9-11"] },
  { n: 107, ld: 43, q: "Is it enough then that we do not murder our neighbor in any such way?", a: "No. By forbidding murder God tells us that he wants us to love our neighbors as ourselves, to be patient, peace-loving, gentle, merciful, and friendly to them, to protect them from harm as much as we can, and to do good even to our enemies.", refs: ["Matt. 22:39", "Matt. 5:3-12", "Luke 6:27-28,35", "Rom. 12:10,18", "Gal. 6:1-2", "Eph. 4:2", "Col. 3:12-14", "1 Pet. 3:8-11"] },
  // LORD'S DAY 44
  { n: 108, ld: 44, q: "What is God's will for us in the seventh commandment?", a: "God condemns all unchastity. We should therefore thoroughly detest it and, married or single, live decent and chaste lives.", refs: ["Lev. 18:30", "Eph. 5:3-5", "Jude 22-23", "1 Cor. 7:1-9", "1 Thess. 4:3-8", "Heb. 13:4"] },
  { n: 109, ld: 44, q: "Does God, in this commandment, forbid only such scandalous sins as adultery?", a: "We are temples of the Holy Spirit, body and soul, and God wants both to be kept clean and holy. That is why he forbids everything which incites unchastity, whether it be actions, looks, talk, thoughts, or desires.", refs: ["Matt. 5:27-29", "1 Cor. 6:18-20", "Eph. 5:18"] },
  // LORD'S DAY 45
  { n: 110, ld: 45, q: "What does God forbid in the eighth commandment?", a: "He forbids not only outright theft and robbery, punishable by law. But in God's sight theft also includes all scheming and swindling in order to get our neighbor's goods for ourselves, whether by force or means that appear legitimate, such as inaccurate measurements of weight, size, or volume; fraudulent merchandising; counterfeit money; excessive interest; or any other means forbidden by God. In addition God forbids all greed and pointless squandering of his gifts.", refs: ["Exod. 22:1", "1 Cor. 5:9-10", "1 Cor. 6:9-10", "Luke 3:14", "Jas. 5:1-6", "Matt. 25:26-27", "Luke 16:10-12"] },
  { n: 111, ld: 45, q: "What does God require of you in this commandment?", a: "That I do whatever I can for my neighbor's good, that I treat others as I would like them to treat me, and that I work faithfully so that I may share with those in need.", refs: ["Matt. 7:12", "Gal. 6:9-10", "Eph. 4:28"] },
  // LORD'S DAY 46
  { n: 112, ld: 46, q: "What is God's will for you in the ninth commandment?", a: "God's will is that I never give false testimony against anyone, twist no one's words, not gossip or slander, nor join in condemning anyone without a hearing or without a just cause. Rather, in court and everywhere else, I should avoid lying and deceit of every kind; these are devices the devil himself uses, and they would call down on me God's intense anger. I should love the truth, speak it candidly, and openly acknowledge it. And I should do what I can to guard and advance my neighbor\u2019s good name.", refs: ["Ps. 15", "Prov. 19:5,9", "Prov. 21:28", "Matt. 7:1", "Luke 6:37", "Rom. 1:28-32", "1 Cor. 13:6", "Eph. 4:25"] },
  // LORD'S DAY 47
  { n: 113, ld: 47, q: "What is God's will for you in the tenth commandment?", a: "That not even the slightest thought or desire contrary to any one of God's commandments should ever arise in my heart. Rather, with all my heart I should always hate sin and take pleasure in whatever is right.", refs: ["Ps. 19:7-14", "Rom. 7:7-8", "Rom. 8:7-8", "Jas. 1:14-15"] },
  // LORD'S DAY 48
  { n: 114, ld: 48, q: "But can those converted to God obey these commandments perfectly?", a: "No. In this life even the holiest have only a small beginning of this obedience. Nevertheless, with all seriousness of purpose, they do begin to live according to all, not only some, of God's commandments.", refs: ["Eccl. 7:20", "Rom. 7:14-15", "1 Cor. 13:9", "1 John 1:8-10", "Ps. 1:1", "Rom. 7:22-25"] },
  { n: 115, ld: 48, q: "Since no one in this life can obey the Ten Commandments perfectly, why does God want them preached so pointedly?", a: "First, so that the longer we live the more we may come to know our sinfulness and the more eagerly we may look to Christ for the forgiveness of sins and the righteousness he gives us. Second, so that, while praying to God for the grace of the Holy Spirit, we may never stop striving to be renewed more and more after God's image, until after this life we reach our goal: perfection.", refs: ["Ps. 32:5", "Rom. 3:19-26", "Rom. 7:7,24-25", "1 Cor. 9:24", "Phil. 3:12-14", "1 John 3:1-3"] },
  // LORD'S DAY 49 (Prayer)
  { n: 116, ld: 49, q: "Why do Christians need to pray?", a: "Because prayer is the most important part of the thankfulness God requires of us. And also because God gives his grace and Holy Spirit only to those who pray continually and groan inwardly, asking God for these gifts and thanking him for them.", refs: ["Ps. 50:14-15", "Ps. 116:12-19", "1 Thess. 5:17", "Matt. 7:7-8", "Luke 11:9-10"] },
  { n: 117, ld: 49, q: "How does God want us to pray so that he will listen to us?", a: "First, we must pray from the heart to no other than the one true God, who has revealed himself in his Word, asking for everything he has commanded us to ask for. Second, we must acknowledge our need and misery, hiding nothing, and humble ourselves in his majestic presence. Third, we must rest on this unshakeable foundation: even though we do not deserve it, God will surely listen to our prayer because of Christ our Lord. That is what he promised us in his Word.", refs: ["Ps. 145:18-20", "John 4:22-24", "Rom. 8:26-27", "1 John 5:14-15", "Jas. 4:6", "2 Chron. 7:14", "Ps. 2:11", "John 14:13-14", "John 16:23", "Dan. 9:17-19", "Matt. 7:8"] },
  { n: 118, ld: 49, q: "What did God command us to pray for?", a: "Everything we need, spiritually and physically, as embraced in the prayer Christ our Lord himself taught us.", refs: ["Jas. 1:17", "Matt. 6:33"] },
  { n: 119, ld: 49, q: "What is this prayer?", a: "Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven. Give us this day our daily bread. And forgive us our debts, as we also have forgiven our debtors. And lead us not into temptation, but deliver us from the evil one. For yours is the kingdom and the power and the glory forever. Amen.", refs: ["Matt. 6:9-13", "Luke 11:2-4"] },
  // LORD'S DAY 50
  { n: 120, ld: 50, q: "Why did Christ command us to call God 'our Father'?", a: "At the very beginning of our prayer Christ wants to kindle in us what is basic to our prayer— the childlike awe and trust that God through Christ has become our Father. Our fathers do not refuse us the things of this life; God our Father will even less refuse to give us what we ask in faith.", refs: ["Matt. 7:9-11", "Luke 11:11-13"] },
  { n: 121, ld: 50, q: "Why the words 'in heaven'?", a: "These words teach us not to think of God's heavenly majesty as something earthly, and to expect everything for body and soul from his almighty power.", refs: ["Jer. 23:23-24", "Acts 17:24-25", "Matt. 6:25-34"] },
  // LORD'S DAY 51
  { n: 122, ld: 51, q: "What does the first request mean?", a: "'Hallowed be your name' means: Help us to really know you, to bless, worship, and praise you for all your works and for all that shines forth from them: your almighty power, wisdom, kindness, justice, mercy, and truth. And it means: Help us to direct all our living— what we think, say, and do— so that your name will never be blasphemed because of us but always honored and praised.", refs: ["Ps. 119:137", "Matt. 6:9", "Ps. 71:8", "Luke 1:46-55"] },
  // LORD'S DAY 52
  { n: 123, ld: 52, q: "What does the second request mean?", a: "'Your kingdom come' means: Rule us by your Word and Spirit in such a way that more and more we submit to you. Keep your church strong, and add to it. Destroy the devil's work; destroy every force which revolts against you and every conspiracy against your Word. Do this until your kingdom is so complete and perfect that in it you are all in all.", refs: ["Ps. 119:5,105", "Acts 2:42-47", "1 John 3:8", "Rom. 16:20", "Rev. 22:17,20"] },
  { n: 124, ld: 52, q: "What does the third request mean?", a: "'Your will be done, on earth as it is in heaven' means: Help us and all people to reject our own wills and to obey your will without any back talk. Your will alone is good. Help us one and all to carry out the work we are called to, as willingly and faithfully as the angels in heaven.", refs: ["Matt. 7:21", "Luke 22:42", "Rom. 12:1-2", "Titus 2:11-12", "Ps. 103:20-21"] },
  { n: 125, ld: 52, q: "What does the fourth request mean?", a: "'Give us this day our daily bread' means: Do take care of all our physical needs so that we come to know that you are the only source of everything good, and that neither our work and worry nor your gifts can do us any good without your blessing. And so help us to give up our trust in creatures and to put trust only in you.", refs: ["Ps. 104:27-30", "Ps. 145:15-16", "Matt. 6:25-34", "Acts 14:17", "Jas. 1:17"] },
  { n: 126, ld: 52, q: "What does the fifth request mean?", a: "'And forgive us our debts, as we also have forgiven our debtors' means: Because of Christ's blood, do not hold against us, poor sinners that we are, any of the sins we do or the evil that constantly clings to us. Forgive us just as we are fully determined, as evidence of your grace in us, to forgive our neighbors.", refs: ["Ps. 51:1-7", "Matt. 6:14-15", "Matt. 18:21-35", "Luke 11:4"] },
  { n: 127, ld: 52, q: "What does the sixth request mean?", a: "'And lead us not into temptation, but deliver us from the evil one' means: By ourselves we are too weak to hold our own even for a moment. And our sworn enemies— the devil, the world, and our own flesh— never stop attacking us. And so, Lord, uphold us and make us strong with the strength of your Holy Spirit, so that we may not go down to defeat in this spiritual struggle, but may firmly resist our enemies until we finally win the complete victory.", refs: ["Ps. 103:14-16", "John 15:1-5", "1 Cor. 10:13", "Eph. 6:10-13", "1 Thess. 3:13", "1 Thess. 5:23"] },
  { n: 128, ld: 52, q: "What does your conclusion to this prayer mean?", a: "'For yours is the kingdom and the power and the glory forever' means: We have made all these requests of you because, as our all-powerful king, you both can and will give us all that is good; and because your holy name, and not we ourselves, should receive all the praise, forever.", refs: ["Rom. 10:11-13", "2 Pet. 2:9", "Ps. 115:1"] },
  { n: 129, ld: 52, q: "What does that little word 'Amen' express?", a: "Amen means: This is sure to be! It is even more sure that God listens to my prayer than that I really desire what I pray for.", refs: ["Isa. 65:24", "2 Cor. 1:20", "2 Tim. 2:13"] },
];
