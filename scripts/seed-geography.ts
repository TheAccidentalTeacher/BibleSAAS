/**
 * seed-geography.ts
 *
 * Seeds geographic_locations, passage_locations, and archaeological_sites
 * with the ~90 most significant Biblical locations.
 *
 * Usage: npx ts-node --project tsconfig.seed.json scripts/seed-geography.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Location data ─────────────────────────────────────────────────────────────

interface GeoLocation {
  name: string;
  alternate_names?: string[];
  modern_name?: string;
  lat: number;
  lng: number;
  location_type: "city" | "mountain" | "river" | "sea" | "region" | "desert" | "valley" | "well" | "plain";
  description: string;
  significance: string;
}

const LOCATIONS: GeoLocation[] = [
  // ── The Holy Land ──────────────────────────────────────────────────────────
  {
    name: "Jerusalem",
    alternate_names: ["Zion", "Salem", "Jebus", "City of David", "Holy City"],
    modern_name: "Jerusalem, Israel",
    lat: 31.7683, lng: 35.2137,
    location_type: "city",
    description: "Capital of Israel under David and Solomon; site of the Temple; city of the Passion, Resurrection, and Pentecost.",
    significance: "The city where God chose to dwell among his people. Every redemptive thread runs through or toward Jerusalem.",
  },
  {
    name: "Bethlehem",
    alternate_names: ["Bethlehem Ephrathah"],
    modern_name: "Bethlehem, West Bank",
    lat: 31.7054, lng: 35.2024,
    location_type: "city",
    description: "City of David, birthplace of Jesus. Where Ruth gleaned, where David was anointed, where the Word became flesh.",
    significance: "The intersection of the ancient royal line and the incarnation.",
  },
  {
    name: "Nazareth",
    alternate_names: [],
    modern_name: "Nazareth, Israel",
    lat: 32.7021, lng: 35.2978,
    location_type: "city",
    description: "The hometown of Jesus, where he was raised and first preached in the synagogue.",
    significance: "'Can anything good come from Nazareth?' — the scandal of the ordinary as the dwelling place of the extraordinary.",
  },
  {
    name: "Capernaum",
    alternate_names: ["Kapernaum"],
    modern_name: "Kfar Nahum ruins, Sea of Galilee, Israel",
    lat: 32.8804, lng: 35.5751,
    location_type: "city",
    description: "Jesus's base of ministry in Galilee. Home of Peter and Andrew. Site of many healings and the famous Bread of Life sermon.",
    significance: "A fishing village that became the center of the Kingdom's in-breaking.",
  },
  {
    name: "Jericho",
    alternate_names: ["City of Palms"],
    modern_name: "Jericho, West Bank",
    lat: 31.8667, lng: 35.4497,
    location_type: "city",
    description: "The first city conquered in Canaan. Also where Zacchaeus climbed a sycamore, where Bartimaeus received sight.",
    significance: "The city whose walls fell to faith — and later the mirror for grace extended to a tax collector.",
  },
  {
    name: "Hebron",
    alternate_names: ["Kiriath-arba"],
    modern_name: "Hebron, West Bank",
    lat: 31.5309, lng: 35.0998,
    location_type: "city",
    description: "Site of the Cave of Machpelah — burial place of Abraham, Sarah, Isaac, Rebekah, Jacob, and Leah. David's first capital.",
    significance: "The patriarchal burial ground — where the promise was buried and waited for resurrection.",
  },
  {
    name: "Bethel",
    alternate_names: ["Luz"],
    modern_name: "Beit El, West Bank",
    lat: 31.9209, lng: 35.2223,
    location_type: "city",
    description: "Where Jacob dreamed of a ladder to heaven and God confirmed the Abrahamic covenant. Later a site of idolatry under Jeroboam.",
    significance: "The gate of heaven — and later an example of how worship corrupted becomes the inverse.",
  },
  {
    name: "Beersheba",
    alternate_names: ["Beer-Sheba"],
    modern_name: "Be'er Sheva, Israel",
    lat: 31.2516, lng: 34.7915,
    location_type: "city",
    description: "The southernmost inhabited city of ancient Israel ('Dan to Beersheba'). Abraham's well, Elijah's tree.",
    significance: "The edge of the inhabited world — and the place God met Elijah in exhaustion.",
  },
  {
    name: "Samaria",
    alternate_names: ["Shomron"],
    modern_name: "Sebastiye ruins, West Bank",
    lat: 32.2779, lng: 35.1919,
    location_type: "city",
    description: "Capital of the northern kingdom of Israel. Also the region where Jesus met the Samaritan woman at the well.",
    significance: "The place the southern kingdom despised — and where Jesus deliberately went.",
  },
  {
    name: "Bethsaida",
    alternate_names: [],
    modern_name: "Et-Tell, Golan Heights",
    lat: 32.9053, lng: 35.6428,
    location_type: "city",
    description: "Hometown of Philip, Andrew, and Peter. Jesus healed a blind man here in stages — a parable become miracle.",
    significance: "Where Jesus healed in two stages: 'I see people, but they look like trees walking.'",
  },
  {
    name: "Caesarea Philippi",
    alternate_names: ["Paneas"],
    modern_name: "Banias ruins, Golan Heights",
    lat: 33.2483, lng: 35.6942,
    location_type: "city",
    description: "At the foot of Mount Hermon, near a cave sanctuary to Pan. Where Peter confessed Jesus as the Messiah.",
    significance: "On the threshold of pagan worship, Jesus asked 'Who do you say I am?' — and the church was declared.",
  },
  {
    name: "Cana of Galilee",
    alternate_names: ["Cana"],
    modern_name: "Kafr Kanna, Israel",
    lat: 32.7491, lng: 35.3386,
    location_type: "city",
    description: "Site of Jesus's first miracle: water into wine at a wedding. Also where he healed the official's son at a distance.",
    significance: "The beginning of signs — abundance poured into what was empty.",
  },
  {
    name: "Gethsemane",
    alternate_names: ["Garden of Gethsemane", "Olive Press"],
    modern_name: "Mount of Olives, Jerusalem",
    lat: 31.7786, lng: 35.2396,
    location_type: "valley",
    description: "The garden at the foot of the Mount of Olives where Jesus prayed 'Not my will, but yours' the night of his arrest.",
    significance: "The place where obedience was worked out through agony — the altar before the cross.",
  },
  {
    name: "Bethany",
    alternate_names: [],
    modern_name: "Al-Eizariya, West Bank",
    lat: 31.7760, lng: 35.2620,
    location_type: "city",
    description: "Village of Mary, Martha, and Lazarus. Where Jesus raised Lazarus, and where he was anointed for burial.",
    significance: "The safest place — and also where the resurrection was preached before the resurrection.",
  },
  {
    name: "Sea of Galilee",
    alternate_names: ["Lake Gennesaret", "Sea of Tiberias", "Kinneret"],
    modern_name: "Sea of Galilee, Israel",
    lat: 32.8321, lng: 35.5854,
    location_type: "sea",
    description: "The freshwater lake around which most of Jesus's Galilean ministry happened. Fishermen, calmed storms, walking on water.",
    significance: "The geography of election — ordinary water made extraordinary, ordinary men made apostles.",
  },
  {
    name: "Jordan River",
    alternate_names: ["Ha-Yarden"],
    modern_name: "Jordan River, Israel/Jordan",
    lat: 31.8308, lng: 35.5448,
    location_type: "river",
    description: "The river Israel crossed into Canaan. Where Jesus was baptized by John. A boundary and a beginning.",
    significance: "The transitional water — crossing into promise, descending into calling.",
  },
  {
    name: "Dead Sea",
    alternate_names: ["Salt Sea", "Sea of Arabah"],
    modern_name: "Dead Sea, Israel/Jordan/West Bank",
    lat: 31.5592, lng: 35.4732,
    location_type: "sea",
    description: "The lowest point on earth. Receives the Jordan but has no outlet. Where Sodom and Gomorrah may have been submerged.",
    significance: "A geographical image of what happens when there is receiving without outpouring.",
  },
  {
    name: "Mount Carmel",
    alternate_names: ["Carmel"],
    modern_name: "Mount Carmel, Israel",
    lat: 32.7300, lng: 34.9890,
    location_type: "mountain",
    description: "Site of Elijah's contest with the 450 prophets of Baal. Fire fell from heaven in response to Elijah's prayer.",
    significance: "The place that answered the question — and then showed the prophet his exhaustion.",
  },
  {
    name: "Mount Tabor",
    alternate_names: ["Tabor"],
    modern_name: "Mount Tabor, Israel",
    lat: 32.6865, lng: 35.3940,
    location_type: "mountain",
    description: "Traditionally the site of the Transfiguration where Jesus appeared with Moses and Elijah in blinding light.",
    significance: "The mountain that revealed what was always true about Jesus.",
  },
  {
    name: "Mount of Olives",
    alternate_names: ["Olivet"],
    modern_name: "Mount of Olives, Jerusalem",
    lat: 31.7784, lng: 35.2463,
    location_type: "mountain",
    description: "East of Jerusalem. Site of Jesus's triumphal entry, his Olivet Discourse, Gethsemane prayer, and his ascension.",
    significance: "The mountain from which the King entered, wept, prayed, and departed — and to which he will return.",
  },
  {
    name: "Valley of Elah",
    alternate_names: [],
    modern_name: "Elah Valley, Israel",
    lat: 31.7000, lng: 34.9500,
    location_type: "valley",
    description: "Where David killed Goliath with a stone and a sling while the armies of Israel stood paralyzed on the opposite hill.",
    significance: "The battle that redefined what faithfulness looks like under impossible odds.",
  },
  {
    name: "Dothan",
    alternate_names: [],
    modern_name: "Tell Dothan, West Bank",
    lat: 32.4025, lng: 35.2177,
    location_type: "city",
    description: "Where Joseph was thrown into a pit by his brothers and sold to Midianite traders. Also where Elisha's servant saw the angel army.",
    significance: "The pit before the palace — and the place where betrayal became the door to purpose.",
  },
  {
    name: "Shechem",
    alternate_names: ["Sychar", "Nablus"],
    modern_name: "Nablus, West Bank",
    lat: 32.2158, lng: 35.2592,
    location_type: "city",
    description: "Where Abraham first entered Canaan. Where Jacob's well was. Where the Samaritan woman met Jesus at mid-day.",
    significance: "The ground of covenant arrival — and of the longest recorded conversation Jesus had.",
  },
  {
    name: "Jezreel",
    alternate_names: [],
    modern_name: "Jezreel Valley, Israel",
    lat: 32.5561, lng: 35.3267,
    location_type: "plain",
    description: "The great valley where Ahab killed Naboth, where Jezebel died, and where the great end-times battle is sometimes located.",
    significance: "The valley of injustice, divine judgment, and prophetic fulfillment.",
  },

  // ── Egypt & North Africa ───────────────────────────────────────────────────
  {
    name: "Egypt",
    alternate_names: ["Mizraim", "Land of Ham"],
    modern_name: "Egypt",
    lat: 30.0626, lng: 31.2497,
    location_type: "region",
    description: "Land of Joseph's imprisonment and exaltation, of Israel's bondage, of the Exodus. Also the refuge of the holy family.",
    significance: "The furnace — and also a recurring metaphor for both enslavement and refuge.",
  },
  {
    name: "Alexandria",
    alternate_names: [],
    modern_name: "Alexandria, Egypt",
    lat: 31.2001, lng: 29.9187,
    location_type: "city",
    description: "Great Egyptian port city where Apollos was from. Later a center of early Christian scholarship.",
    significance: "Where the intellectual and the devotional met — and sometimes clashed.",
  },
  {
    name: "Mount Sinai",
    alternate_names: ["Horeb", "Mountain of God"],
    modern_name: "Jebel Musa, Sinai Peninsula, Egypt",
    lat: 28.5388, lng: 33.9750,
    location_type: "mountain",
    description: "Where God appeared to Moses in the burning bush, gave the Ten Commandments, and revealed his glory.",
    significance: "The mountain of covenant — where heaven touched earth and the law was given.",
  },
  {
    name: "Goshen",
    alternate_names: [],
    modern_name: "Nile Delta region, Egypt",
    lat: 30.7000, lng: 31.8000,
    location_type: "region",
    description: "The fertile land in the eastern Nile delta given to Israel during Joseph's rule. Protected during the plagues.",
    significance: "The place of preservation — distinction maintained when judgment fell.",
  },
  {
    name: "Red Sea",
    alternate_names: ["Sea of Reeds", "Reed Sea", "Yam Suph"],
    modern_name: "Red Sea",
    lat: 27.5000, lng: 33.5000,
    location_type: "sea",
    description: "The sea parted by Moses at God's command as Israel fled Egypt. The Egyptians were drowned in its return.",
    significance: "The impossible crossing — the signature moment of redemption that all Israel remembered.",
  },

  // ── Mesopotamia ────────────────────────────────────────────────────────────
  {
    name: "Babylon",
    alternate_names: ["Babel", "Shinar capital"],
    modern_name: "Babylon ruins, Al Hillah, Iraq",
    lat: 32.5363, lng: 44.4208,
    location_type: "city",
    description: "Capital of the Babylonian empire. Where Daniel interpreted dreams, where the exiles hung their harps and wept.",
    significance: "The empire that exiled God's people — and the metaphor for worldly power in Revelation.",
  },
  {
    name: "Nineveh",
    alternate_names: ["Ninus"],
    modern_name: "Mosul ruins, Iraq",
    lat: 36.3592, lng: 43.1566,
    location_type: "city",
    description: "Capital of Assyria. The city Jonah refused to go to, then went to, and whose repentance he resented.",
    significance: "The city too big to compass — and the demonstration that God's grace reaches beyond Israel.",
  },
  {
    name: "Ur",
    alternate_names: ["Ur of the Chaldeans"],
    modern_name: "Tell el-Muqayyar, Iraq",
    lat: 30.9626, lng: 46.1031,
    location_type: "city",
    description: "Birthplace of Abraham. One of the great cities of ancient Sumeria. Abraham left it not knowing where he was going.",
    significance: "Where the call came — and where the first act of faith was leaving everything.",
  },
  {
    name: "Haran",
    alternate_names: ["Harran"],
    modern_name: "Harran, Şanlıurfa Province, Turkey",
    lat: 36.8637, lng: 39.0293,
    location_type: "city",
    description: "City where Abraham's family settled after leaving Ur. Where Jacob fled to Laban and found his wives.",
    significance: "The halfway house between calling and fulfillment.",
  },
  {
    name: "Susa",
    alternate_names: ["Shushan"],
    modern_name: "Shush, Iran",
    lat: 32.1895, lng: 48.2586,
    location_type: "city",
    description: "Persian royal capital. Where Esther lived, where Nehemiah served, where Daniel had visions.",
    significance: "The Persian court — where God's people found themselves in the engine room of empire.",
  },

  // ── Syria & Northern Levant ────────────────────────────────────────────────
  {
    name: "Damascus",
    alternate_names: [],
    modern_name: "Damascus, Syria",
    lat: 33.5138, lng: 36.2765,
    location_type: "city",
    description: "Ancient city of Syria. Where Paul was walking when he was blinded by the risen Christ. One of the oldest continuously inhabited cities on earth.",
    significance: "The road to Damascus — where the church's greatest persecutor became its greatest advocate.",
  },
  {
    name: "Antioch of Syria",
    alternate_names: ["Antioch on the Orontes"],
    modern_name: "Antakya, Turkey",
    lat: 36.2021, lng: 36.1606,
    location_type: "city",
    description: "Third-largest city of the Roman Empire. Where believers were first called 'Christians.' Base of Paul's missionary journeys.",
    significance: "The launch site of the Gentile mission — and where the name 'Christian' stuck.",
  },
  {
    name: "Tyre",
    alternate_names: ["Tzor"],
    modern_name: "Tyre (Sur), Lebanon",
    lat: 33.2705, lng: 35.1974,
    location_type: "city",
    description: "Phoenician seaport. Hiram of Tyre supplied timber and craftsmen for Solomon's Temple. Jesus healed in its region.",
    significance: "The commercial powerhouse that supplied the Temple — and to whose shores Jesus traveled.",
  },
  {
    name: "Sidon",
    alternate_names: [],
    modern_name: "Sidon (Saida), Lebanon",
    lat: 33.5606, lng: 35.3706,
    location_type: "city",
    description: "Phoenician city north of Tyre. Jesus met the Syrophoenician (Canaanite) woman near here. Paul stopped here on his voyage to Rome.",
    significance: "The pagan woman who was refused and persisted — the faith that surprised even Jesus.",
  },
  {
    name: "Carchemish",
    alternate_names: [],
    modern_name: "Karkamış, Gaziantep, Turkey",
    lat: 36.8354, lng: 38.0124,
    location_type: "city",
    description: "Site of the decisive battle of 605 BC where Nebuchadnezzar defeated Egypt and established Babylonian dominance. Referenced in Jeremiah.",
    significance: "The turning point of the ancient world — where the balance of power shifted and the exile began.",
  },
  {
    name: "Mount Hermon",
    alternate_names: ["Sirion", "Senir"],
    modern_name: "Mount Hermon, Syria/Lebanon/Israel",
    lat: 33.4186, lng: 35.8574,
    location_type: "mountain",
    description: "The tallest peak in the Levant, snow-capped year-round. Possible site of the Transfiguration.",
    significance: "The high place — snow-crowned and gleaming, a backdrop to divine glory.",
  },

  // ── Asia Minor (Turkey) ────────────────────────────────────────────────────
  {
    name: "Ephesus",
    alternate_names: [],
    modern_name: "Efes ruins, İzmir Province, Turkey",
    lat: 37.9394, lng: 27.3409,
    location_type: "city",
    description: "Greatest city of Roman Asia. Where Paul spent 3 years. Where Timothy ministered. One of the seven churches of Revelation.",
    significance: "The first love — and its first forsaking.",
  },
  {
    name: "Galatia",
    alternate_names: [],
    modern_name: "Central Anatolia, Turkey",
    lat: 39.0000, lng: 32.5000,
    location_type: "region",
    description: "A region of Asia Minor settled by Celtic (Galatian) tribes. Paul's letter to the Galatians defends justification by faith alone.",
    significance: "The ground where Paul fought the hardest fight for the freedom of the gospel.",
  },
  {
    name: "Iconium",
    alternate_names: [],
    modern_name: "Konya, Turkey",
    lat: 37.8746, lng: 32.4932,
    location_type: "city",
    description: "City of Paul's first and second missionary journeys. Paul and Barnabas preached here, were threatened with stoning, and fled.",
    significance: "Persecution and planting — the two things that always appear together in Acts.",
  },
  {
    name: "Lystra",
    alternate_names: [],
    modern_name: "Near Hatunsaray, Konya, Turkey",
    lat: 37.5847, lng: 32.4940,
    location_type: "city",
    description: "Where Paul healed a cripple and the crowd tried to worship him as Hermes; then stoned him and left him for dead.",
    significance: "From god to corpse in one afternoon — the volatility of crowd-based faith.",
  },
  {
    name: "Smyrna",
    alternate_names: [],
    modern_name: "İzmir, Turkey",
    lat: 38.4192, lng: 27.1287,
    location_type: "city",
    description: "One of the seven churches of Revelation. 'I know your tribulation and poverty — yet you are rich.' Polycarp died here.",
    significance: "The church that had nothing by the world's standards and everything by God's.",
  },
  {
    name: "Laodicea",
    alternate_names: [],
    modern_name: "Laodikeia ruins, Denizli, Turkey",
    lat: 37.8349, lng: 29.1066,
    location_type: "city",
    description: "Wealthy commercial city, one of the seven churches of Revelation. 'You are lukewarm — neither hot nor cold.'",
    significance: "The church that confused material prosperity for spiritual health.",
  },
  {
    name: "Pergamon",
    alternate_names: ["Pergamum"],
    modern_name: "Bergama, İzmir, Turkey",
    lat: 39.1203, lng: 27.1842,
    location_type: "city",
    description: "Seat of Roman authority in Asia, where 'Satan's throne' was. Major pagan temple complex. One of the seven churches.",
    significance: "Where the church lived in the shadow of power — and held fast to the name.",
  },
  {
    name: "Tarsus",
    alternate_names: [],
    modern_name: "Tarsus, Mersin, Turkey",
    lat: 36.9122, lng: 34.8939,
    location_type: "city",
    description: "Birthplace of Paul. A cosmopolitan Hellenistic city and Roman provincial capital. 'I am a Jew from Tarsus, a citizen of no ordinary city.'",
    significance: "Where the man who would interpret Judaism to the world was formed.",
  },
  {
    name: "Troas",
    alternate_names: ["Alexandria Troas"],
    modern_name: "Dalyan ruins, Çanakkale, Turkey",
    lat: 39.7543, lng: 26.1648,
    location_type: "city",
    description: "The port city from which Paul crossed to Macedonia after the vision of the Macedonian man saying 'Come over and help us.'",
    significance: "The harbor of the Western mission — where Europe was opened.",
  },

  // ── Greece (Macedonia & Achaia) ─────────────────────────────────────────────
  {
    name: "Philippi",
    alternate_names: [],
    modern_name: "Kavala ruins, Eastern Macedonia, Greece",
    lat: 41.0122, lng: 24.2886,
    location_type: "city",
    description: "First European city Paul visited. Where Lydia was converted, where Paul and Silas were imprisoned and sang, where an earthquake came.",
    significance: "Europe's first church — planted in a prison, begun at a riverside.",
  },
  {
    name: "Thessalonica",
    alternate_names: [],
    modern_name: "Thessaloniki, Greece",
    lat: 40.6401, lng: 22.9444,
    location_type: "city",
    description: "Macedonian capital. Paul preached here for three weeks; a church was established. Paul wrote two letters encouraging and correcting them.",
    significance: "The church under pressure — and the community Paul boasted about.",
  },
  {
    name: "Berea",
    alternate_names: ["Beroia"],
    modern_name: "Veria, Macedonia, Greece",
    lat: 40.5219, lng: 22.2042,
    location_type: "city",
    description: "Where Paul found more noble-minded hearers who examined the scriptures daily to see if Paul's teaching was true.",
    significance: "'The Bereans were more noble-minded' — the gold standard for receiving teaching.",
  },
  {
    name: "Athens",
    alternate_names: ["Athenai"],
    modern_name: "Athens, Greece",
    lat: 37.9755, lng: 23.7348,
    location_type: "city",
    description: "Cultural capital of the Greek world. Paul reasoned in the Areopagus with Epicurean and Stoic philosophers.",
    significance: "Where the gospel met philosophy — and Paul found an altar to an unknown God.",
  },
  {
    name: "Corinth",
    alternate_names: [],
    modern_name: "Ancient Corinth ruins, Peloponnese, Greece",
    lat: 37.9080, lng: 22.8793,
    location_type: "city",
    description: "Cosmopolitan commercial port, notorious for licentiousness. Paul's longest stay on any missionary journey was here — 18 months.",
    significance: "The difficult church — and possibly the most theologically rich correspondence in the New Testament.",
  },
  {
    name: "Mars Hill",
    alternate_names: ["Areopagus"],
    modern_name: "Areopagos Hill, Athens, Greece",
    lat: 37.9720, lng: 23.7225,
    location_type: "plain",
    description: "The ancient hill court of Athens where Paul delivered his famous address: 'In him we live and move and have our being.'",
    significance: "The sermon that met culture on its own terms — citing pagan poets to point to the God of Israel.",
  },

  // ── Italy ─────────────────────────────────────────────────────────────────
  {
    name: "Rome",
    alternate_names: ["Roma"],
    modern_name: "Rome, Italy",
    lat: 41.9028, lng: 12.4964,
    location_type: "city",
    description: "Capital of the Roman Empire. Paul wrote his most systematic letter to the church here before arriving. He died here under Nero.",
    significance: "The letter to the Romans — the fullest theological statement in Scripture. And the end of the road.",
  },
  {
    name: "Puteoli",
    alternate_names: ["Pozzuoli"],
    modern_name: "Pozzuoli, Campania, Italy",
    lat: 40.8277, lng: 14.1241,
    location_type: "city",
    description: "Where Paul and the shipwrecked party landed in Italy and found brothers who took them in for a week.",
    significance: "The church that appeared at the edge of the known world — family found at harbor.",
  },

  // ── Islands ────────────────────────────────────────────────────────────────
  {
    name: "Malta",
    alternate_names: ["Melita"],
    modern_name: "Malta",
    lat: 35.9375, lng: 14.3754,
    location_type: "region",
    description: "The island where Paul's ship wrecked in the storm. The snake that bit him caused no harm; the islanders saw a miracle.",
    significance: "Shipwrecked but not lost — the storm that was both judgment and protection.",
  },
  {
    name: "Cyprus",
    alternate_names: [],
    modern_name: "Cyprus",
    lat: 35.1264, lng: 33.4299,
    location_type: "region",
    description: "Homeland of Barnabas. First stop on Paul and Barnabas's first missionary journey. Sergius Paulus, the governor, believed.",
    significance: "Where the mission began — and where a governor of Rome was converted.",
  },
  {
    name: "Patmos",
    alternate_names: [],
    modern_name: "Patmos, Dodecanese, Greece",
    lat: 37.3208, lng: 26.5466,
    location_type: "region",
    description: "The island of John's exile where he received the Revelation. 'I was in the Spirit on the Lord's Day.'",
    significance: "The place of exile that became the place of vision.",
  },
  {
    name: "Crete",
    alternate_names: [],
    modern_name: "Crete, Greece",
    lat: 35.2401, lng: 24.8093,
    location_type: "region",
    description: "Island where Paul left Titus. Titus was to appoint elders, since 'Cretans are always liars, evil brutes, lazy gluttons.'",
    significance: "The hard assignment — planting a church in a culture known for its dysfunction.",
  },

  // ── The Wilderness & Sinai Peninsula ──────────────────────────────────────
  {
    name: "Wilderness of Sinai",
    alternate_names: ["Desert of Sinai"],
    modern_name: "Sinai Peninsula, Egypt",
    lat: 29.5000, lng: 33.7500,
    location_type: "desert",
    description: "The wilderness where Israel wandered 40 years. The place of manna, quail, golden calf, and the pillar of fire.",
    significance: "The formation ground — where a rabble became a people and a people learned that bread comes from heaven.",
  },
  {
    name: "Kadesh Barnea",
    alternate_names: ["Kadesh", "Meribah"],
    modern_name: "Ein el-Qudeirat, Sinai Peninsula, Egypt",
    lat: 30.6736, lng: 34.4124,
    location_type: "city",
    description: "The southernmost border of Canaan where Israel's spies returned from their 40-day survey. Israel refused to enter; 40 years of wandering began.",
    significance: "The great refusal — when unbelief decided what fear could not allow faith to accept.",
  },
  {
    name: "Massah and Meribah",
    alternate_names: ["Rephidim"],
    modern_name: "Wadi Feiran area, Sinai, Egypt",
    lat: 28.7000, lng: 34.0000,
    location_type: "plain",
    description: "Where Israel complained for water, Moses struck the rock, and water flowed. 'Is the LORD among us or not?'",
    significance: "Testing — and the question that the wilderness always forces.",
  },

  // ── Trans-Jordan ───────────────────────────────────────────────────────────
  {
    name: "Mount Nebo",
    alternate_names: ["Pisgah"],
    modern_name: "Mount Nebo, Jordan",
    lat: 31.7638, lng: 35.7294,
    location_type: "mountain",
    description: "The mountain from which Moses viewed the Promised Land he would never enter. 'The LORD showed him the whole land.' Moses died here.",
    significance: "The view without arrival — the servant who led others to a promise he saw but did not enter.",
  },
  {
    name: "Petra",
    alternate_names: ["Sela", "the Rock"],
    modern_name: "Petra, Jordan",
    lat: 30.3285, lng: 35.4444,
    location_type: "city",
    description: "Rose-red carved city of the Nabataean kingdom. Paul fled to this region after his Damascus conversion. Traditional Edomite territory.",
    significance: "The hidden city — and the region where Paul spent years in obscurity before public ministry.",
  },
  {
    name: "Gilead",
    alternate_names: [],
    modern_name: "Ajloun Governorate, Jordan",
    lat: 32.3341, lng: 35.7504,
    location_type: "region",
    description: "Fertile hill country east of the Jordan. Elijah was from Gilead. 'Is there no balm in Gilead?'",
    significance: "The place of refreshing — and that haunting question from Jeremiah about whether healing remains.",
  },

  // ── Patriarchal Territory ─────────────────────────────────────────────────
  {
    name: "Mamre",
    alternate_names: ["Terebinths of Mamre"],
    modern_name: "Near Hebron, West Bank",
    lat: 31.5460, lng: 35.1120,
    location_type: "plain",
    description: "Where Abraham was living when three visitors (angels, or the pre-incarnate Christ) announced the birth of Isaac.",
    significance: "Where the promise was reaffirmed — under the great tree, in the heat of the day.",
  },
  {
    name: "Well of Beer-lahai-roi",
    alternate_names: ["Beer-lahai-roi"],
    modern_name: "Negev, Israel",
    lat: 30.8500, lng: 34.6500,
    location_type: "well",
    description: "Where Hagar fled from Sarah and God met her: 'You are the God who sees me.' The only place in Scripture where a human names God.",
    significance: "The wilderness encounter — 'El Roi,' the God who sees the unseen and forgotten.",
  },
  {
    name: "Peniel",
    alternate_names: ["Penuel"],
    modern_name: "Wadi Jabbok ford, Jordan",
    lat: 32.2034, lng: 35.7263,
    location_type: "plain",
    description: "Where Jacob wrestled all night with the man of God and walked away with both the blessing and a limp.",
    significance: "Striving and surrender all at once — the night God broke Jacob and named him Israel.",
  },

  // ── Prophetic Sites ────────────────────────────────────────────────────────
  {
    name: "Anathoth",
    alternate_names: [],
    modern_name: "Anata ruins, West Bank",
    lat: 31.8344, lng: 35.2731,
    location_type: "city",
    description: "Birthplace and hometown of Jeremiah. He bought a field here as an act of prophetic faith while Jerusalem was falling.",
    significance: "Buying land while the land was being taken — the prophet's act of defiance-as-hope.",
  },
  {
    name: "Tekoa",
    alternate_names: [],
    modern_name: "Khirbet Tequ'a, West Bank",
    lat: 31.6317, lng: 35.2028,
    location_type: "city",
    description: "Hometown of Amos the shepherd-prophet. He watched sheep and fig trees here before God sent him to preach at Bethel.",
    significance: "The ordinary man from an ordinary place — and the message that shook the comfortable.",
  },
  {
    name: "Gath-hepher",
    alternate_names: [],
    modern_name: "Near Nazareth, Israel",
    lat: 32.7300, lng: 35.3100,
    location_type: "city",
    description: "Hometown of Jonah. 'From Galilee no prophet arises' — the Pharisees were wrong. Jonah came from Galilee.",
    significance: "The reluctant prophet's hometown — and the rebuke to those who assumed geography determined grace.",
  },

  // ── Additional NT Sites ────────────────────────────────────────────────────
  {
    name: "Caesarea Maritima",
    alternate_names: ["Caesarea"],
    modern_name: "Caesarea National Park, Israel",
    lat: 32.5020, lng: 34.8936,
    location_type: "city",
    description: "Herod's magnificent port city. Where Cornelius (the first Gentile convert) lived. Where Paul was imprisoned for 2 years before sailing to Rome.",
    significance: "The hinge city — where the Gentile mission opened and where Paul's Roman journey began.",
  },
  {
    name: "Emmaus",
    alternate_names: [],
    modern_name: "Uncertain; near Jerusalem",
    lat: 31.8400, lng: 35.0600,
    location_type: "city",
    description: "The village 7 miles from Jerusalem where two disciples walked with the risen Jesus, not recognizing him, until he broke bread.",
    significance: "The revealed stranger — eyes opened in the breaking of bread.",
  },
  {
    name: "Golgotha",
    alternate_names: ["Calvary", "Place of the Skull"],
    modern_name: "Church of the Holy Sepulchre, Jerusalem",
    lat: 31.7784, lng: 35.2297,
    location_type: "plain",
    description: "The site of the crucifixion — 'the place of the skull.' Jesus was crucified here between two thieves.",
    significance: "The cross — the hinge of history, the death of death, the place where God was forsaken.",
  },
  {
    name: "Joppa",
    alternate_names: ["Jaffa"],
    modern_name: "Jaffa, Tel Aviv, Israel",
    lat: 32.0504, lng: 34.7478,
    location_type: "city",
    description: "Port city where Jonah boarded a ship to flee from God. Also where Peter raised Tabitha and received the vision of the sheet.",
    significance: "The place of flight and vision — where God redirected both a prophet and an apostle.",
  },
];

// ── Passage-location associations ─────────────────────────────────────────────
// Format: [location name, book code, chapter, optional context note]

const PASSAGE_LOC: [string, string, number, string?][] = [
  // Jerusalem
  ["Jerusalem", "2SA", 5, "David captures Jerusalem"],
  ["Jerusalem", "1KI", 6, "Solomon builds the Temple"],
  ["Jerusalem", "1KI", 8, "Solomon dedicates the Temple"],
  ["Jerusalem", "2KI", 25, "Fall of Jerusalem to Babylon"],
  ["Jerusalem", "NEH", 2, "Nehemiah surveys Jerusalem's walls"],
  ["Jerusalem", "NEH", 6, "The wall is completed"],
  ["Jerusalem", "PSA", 48, "Great is the LORD in the city of our God"],
  ["Jerusalem", "PSA", 122, "Pray for the peace of Jerusalem"],
  ["Jerusalem", "ISA", 2, "The mountain of the LORD's house"],
  ["Jerusalem", "LAM", 1, "Jerusalem weeps in the night"],
  ["Jerusalem", "MAT", 21, "Triumphal entry into Jerusalem"],
  ["Jerusalem", "MAT", 26, "The Last Supper"],
  ["Jerusalem", "MAT", 27, "The crucifixion"],
  ["Jerusalem", "MAT", 28, "The resurrection"],
  ["Jerusalem", "LUK", 2, "Jesus in the Temple at 12"],
  ["Jerusalem", "LUK", 24, "Emmaus road, resurrection appearances"],
  ["Jerusalem", "JHN", 2, "Cleansing the Temple"],
  ["Jerusalem", "JHN", 19, "The crucifixion"],
  ["Jerusalem", "ACT", 2, "Pentecost"],
  ["Jerusalem", "ACT", 15, "Jerusalem Council"],
  ["Jerusalem", "REV", 21, "The New Jerusalem"],

  // Bethlehem
  ["Bethlehem", "RUT", 1, "Ruth and Naomi return to Bethlehem"],
  ["Bethlehem", "RUT", 4, "Boaz redeems Ruth"],
  ["Bethlehem", "1SA", 16, "Samuel anoints David"],
  ["Bethlehem", "MIC", 5, "Out of Bethlehem will come a ruler"],
  ["Bethlehem", "MAT", 2, "Birth of Jesus; Magi arrive"],
  ["Bethlehem", "LUK", 2, "Shepherds and the manger"],

  // Nazareth
  ["Nazareth", "LUK", 1, "The Annunciation"],
  ["Nazareth", "LUK", 2, "Jesus grows up in Nazareth"],
  ["Nazareth", "LUK", 4, "Jesus preaches in the Nazareth synagogue; rejected"],
  ["Nazareth", "MAT", 2, "Holy family settles in Nazareth after Egypt"],
  ["Nazareth", "JHN", 1, "Can anything good come from Nazareth?"],

  // Capernaum
  ["Capernaum", "MAT", 4, "Jesus makes Capernaum his base"],
  ["Capernaum", "MAT", 8, "Centurion's servant healed"],
  ["Capernaum", "MRK", 1, "Healing in the synagogue; Peter's mother-in-law"],
  ["Capernaum", "MRK", 2, "Four friends lower the paralyzed man through the roof"],
  ["Capernaum", "JHN", 6, "Bread of Life discourse in the Capernaum synagogue"],

  // Jericho
  ["Jericho", "JOS", 2, "Rahab hides the spies"],
  ["Jericho", "JOS", 6, "The walls fall"],
  ["Jericho", "LUK", 19, "Zacchaeus climbs the sycamore"],
  ["Jericho", "MRK", 10, "Bartimaeus receives sight"],
  ["Jericho", "LUK", 10, "The Good Samaritan (set on the Jericho road)"],

  // Sea of Galilee
  ["Sea of Galilee", "MAT", 4, "Jesus calls Simon, Andrew, James, and John"],
  ["Sea of Galilee", "MAT", 14, "Jesus walks on water"],
  ["Sea of Galilee", "MRK", 4, "Jesus stills the storm"],
  ["Sea of Galilee", "JHN", 21, "Jesus appears on the shore; Peter restored"],
  ["Sea of Galilee", "LUK", 5, "The miraculous catch of fish"],

  // Jordan River
  ["Jordan River", "JOS", 3, "Israel crosses the Jordan on dry ground"],
  ["Jordan River", "2KI", 5, "Naaman dips in the Jordan and is healed"],
  ["Jordan River", "MAT", 3, "Jesus is baptized by John"],
  ["Jordan River", "MRK", 1, "The baptism; Spirit descends as a dove"],

  // Mount Sinai
  ["Mount Sinai", "EXO", 3, "The burning bush"],
  ["Mount Sinai", "EXO", 19, "Israel arrives at Sinai"],
  ["Mount Sinai", "EXO", 20, "The Ten Commandments"],
  ["Mount Sinai", "EXO", 24, "Moses on the mountain 40 days"],
  ["Mount Sinai", "EXO", 32, "The golden calf"],
  ["Mount Sinai", "EXO", 33, "Moses asks to see God's glory"],
  ["Mount Sinai", "EXO", 34, "The new tablets; the radiant face"],
  ["Mount Sinai", "1KI", 19, "Elijah at Horeb — the still small voice"],

  // Egypt
  ["Egypt", "GEN", 12, "Abraham goes down to Egypt"],
  ["Egypt", "GEN", 41, "Joseph interprets Pharaoh's dreams; becomes prime minister"],
  ["Egypt", "GEN", 50, "Joseph buries Jacob in Canaan"],
  ["Egypt", "EXO", 1, "Israel enslaved in Egypt"],
  ["Egypt", "EXO", 12, "The Passover; the Exodus begins"],
  ["Egypt", "EXO", 14, "Israel crosses the Red Sea"],
  ["Egypt", "MAT", 2, "Holy family flees to Egypt; returns"],
  ["Egypt", "ACT", 7, "Stephen's speech reviews Israel's Egyptian history"],

  // Babylon
  ["Babylon", "2KI", 24, "First deportation to Babylon"],
  ["Babylon", "2KI", 25, "Jerusalem falls; temple burned"],
  ["Babylon", "PSA", 137, "By the rivers of Babylon we sat and wept"],
  ["Babylon", "DAN", 1, "Daniel and friends taken to Babylon"],
  ["Babylon", "DAN", 3, "The fiery furnace"],
  ["Babylon", "DAN", 5, "The writing on the wall"],
  ["Babylon", "DAN", 6, "Daniel in the lions' den"],
  ["Babylon", "ISA", 47, "Fall of Babylon prophesied"],
  ["Babylon", "JER", 29, "Jeremiah's letter to the exiles in Babylon"],
  ["Babylon", "REV", 17, "Babylon the Great — the whore of Babylon"],
  ["Babylon", "REV", 18, "Fall of Babylon"],

  // Nineveh
  ["Nineveh", "JON", 1, "Jonah called to Nineveh; flees"],
  ["Nineveh", "JON", 3, "Jonah preaches; Nineveh repents"],
  ["Nineveh", "JON", 4, "Jonah's anger at God's mercy"],
  ["Nineveh", "NAH", 1, "Oracle against Nineveh"],
  ["Nineveh", "NAH", 3, "Woe to the bloody city"],

  // Ur
  ["Ur", "GEN", 11, "Terah takes family from Ur; Abram born"],
  ["Ur", "GEN", 12, "The call of Abraham"],
  ["Ur", "ACT", 7, "Stephen recounts the call of Abraham from Ur"],
  ["Ur", "HEB", 11, "By faith Abraham obeyed the call to go"],

  // Haran
  ["Haran", "GEN", 11, "Terah settles in Haran; dies there"],
  ["Haran", "GEN", 12, "God calls Abraham to leave Haran"],
  ["Haran", "GEN", 28, "Jacob flees to Haran; ladder dream"],
  ["Haran", "GEN", 29, "Jacob arrives in Haran; meets Rachel"],

  // Damascus
  ["Damascus", "GEN", 15, "Eliezer of Damascus, Abraham's servant"],
  ["Damascus", "2KI", 5, "Gehazi and the leprosy of Naaman from Damascus"],
  ["Damascus", "ACT", 9, "Paul's conversion on the road to Damascus"],
  ["Damascus", "ACT", 9, "Paul baptized in Damascus; escapes in a basket"],
  ["Damascus", "GAL", 1, "Paul goes to Arabia then Damascus"],
  ["Damascus", "2CO", 11, "The basket escape from Damascus"],

  // Antioch of Syria
  ["Antioch of Syria", "ACT", 11, "The disciples first called Christians in Antioch"],
  ["Antioch of Syria", "ACT", 13, "Paul and Barnabas sent out from Antioch"],
  ["Antioch of Syria", "ACT", 15, "The Antioch church sends to Jerusalem about circumcision"],
  ["Antioch of Syria", "GAL", 2, "Paul opposes Peter to his face in Antioch"],

  // Ephesus
  ["Ephesus", "ACT", 19, "Paul in Ephesus; the riot of the silversmiths"],
  ["Ephesus", "ACT", 20, "Paul's farewell speech to the Ephesian elders"],
  ["Ephesus", "EPH", 1, "Paul's letter to the Ephesians"],
  ["Ephesus", "REV", 2, "Letter to the church in Ephesus"],
  ["Ephesus", "1TI", 1, "Timothy charged to stay in Ephesus"],

  // Corinth
  ["Corinth", "ACT", 18, "Paul in Corinth — 18 months"],
  ["Corinth", "1CO", 1, "Paul's first letter to Corinth"],
  ["Corinth", "1CO", 13, "The love chapter"],
  ["Corinth", "1CO", 15, "The resurrection chapter"],
  ["Corinth", "2CO", 1, "Paul's second letter to Corinth"],

  // Athens
  ["Athens", "ACT", 17, "Paul at the Areopagus"],

  // Philippi
  ["Philippi", "ACT", 16, "Lydia's conversion; Paul and Silas in prison; earthquake"],
  ["Philippi", "PHP", 1, "Paul's letter to Philippi from prison"],
  ["Philippi", "PHP", 4, "Rejoice in the Lord always"],

  // Thessalonica
  ["Thessalonica", "ACT", 17, "Paul preaches in Thessalonica; riots; flees"],
  ["Thessalonica", "1TH", 1, "First letter to the Thessalonians"],
  ["Thessalonica", "2TH", 1, "Second letter to the Thessalonians"],

  // Rome
  ["Rome", "ACT", 28, "Paul arrives in Rome"],
  ["Rome", "ROM", 1, "Paul's letter to Rome"],
  ["Rome", "ROM", 8, "No condemnation"],
  ["Rome", "PHP", 4, "Written from Rome"],

  // Gethsemane
  ["Gethsemane", "MAT", 26, "Jesus prays; 'Not my will but yours'"],
  ["Gethsemane", "MRK", 14, "Jesus is arrested in the garden"],
  ["Gethsemane", "LUK", 22, "The agony in the garden"],
  ["Gethsemane", "JHN", 18, "Judas leads the soldiers to the garden"],

  // Mount of Olives
  ["Mount of Olives", "ZEC", 14, "His feet will stand on the Mount of Olives"],
  ["Mount of Olives", "MAT", 24, "The Olivet Discourse"],
  ["Mount of Olives", "LUK", 21, "Jerusalem surrounded by armies"],
  ["Mount of Olives", "ACT", 1, "The Ascension from Olivet"],

  // Bethany
  ["Bethany", "JHN", 11, "The raising of Lazarus"],
  ["Bethany", "JHN", 12, "Mary anoints Jesus for burial"],
  ["Bethany", "LUK", 24, "Jesus leads disciples to Bethany and ascends"],

  // Golgotha
  ["Golgotha", "MAT", 27, "The crucifixion"],
  ["Golgotha", "MRK", 15, "The crucifixion"],
  ["Golgotha", "LUK", 23, "The crucifixion"],
  ["Golgotha", "JHN", 19, "The crucifixion"],

  // Caesarea Maritima
  ["Caesarea Maritima", "ACT", 10, "Cornelius's household converted"],
  ["Caesarea Maritima", "ACT", 24, "Paul before Felix in Caesarea"],
  ["Caesarea Maritima", "ACT", 25, "Paul appeals to Caesar; before Festus and Agrippa"],

  // Joppa
  ["Joppa", "JON", 1, "Jonah boards a ship at Joppa"],
  ["Joppa", "ACT", 9, "Peter raises Tabitha in Joppa"],
  ["Joppa", "ACT", 10, "Peter's vision of the sheet on the rooftop in Joppa"],

  // Patmos
  ["Patmos", "REV", 1, "John's vision begins — I was on the island of Patmos"],

  // Shechem / Sychar
  ["Shechem", "GEN", 12, "Abraham enters Canaan and camps at Shechem"],
  ["Shechem", "GEN", 33, "Jacob buys land at Shechem"],
  ["Shechem", "JOS", 24, "Joshua renews the covenant at Shechem"],
  ["Shechem", "JHN", 4, "Jesus and the Samaritan woman at Jacob's well"],

  // Mount Carmel
  ["Mount Carmel", "1KI", 18, "Elijah's contest with the prophets of Baal"],
  ["Mount Carmel", "2KI", 4, "The Shunammite woman's son raised"],

  // Mount Tabor
  ["Mount Tabor", "JDG", 4, "Barak assembles at Tabor; defeats Sisera"],
  ["Mount Tabor", "MAT", 17, "The Transfiguration"],
  ["Mount Tabor", "MRK", 9, "The Transfiguration"],
  ["Mount Tabor", "LUK", 9, "The Transfiguration; Moses and Elijah appear"],

  // Valley of Elah
  ["Valley of Elah", "1SA", 17, "David and Goliath"],

  // Mount Nebo
  ["Mount Nebo", "DEU", 32, "Moses goes up to Mount Nebo"],
  ["Mount Nebo", "DEU", 34, "Moses sees the land and dies"],

  // Peniel / Jabbok
  ["Peniel", "GEN", 32, "Jacob wrestles with God; becomes Israel"],

  // Kadesh Barnea
  ["Kadesh Barnea", "NUM", 13, "The spies return; bad report"],
  ["Kadesh Barnea", "NUM", 14, "Israel refuses to enter; 40 years of wandering"],
  ["Kadesh Barnea", "DEU", 1, "Moses recounts the spy mission"],

  // Susa
  ["Susa", "EST", 1, "Ahasuerus holds a banquet in Susa"],
  ["Susa", "EST", 4, "Mordecai mourns; Esther resolves to act"],
  ["Susa", "NEH", 1, "Nehemiah hears of Jerusalem's state from Susa"],
  ["Susa", "DAN", 8, "Daniel's vision of the ram by the Susa canal"],

  // Tarsus
  ["Tarsus", "ACT", 9, "Paul sent to Tarsus after Jerusalem threatens him"],
  ["Tarsus", "ACT", 11, "Barnabas goes to Tarsus to find Paul"],
  ["Tarsus", "ACT", 22, "Paul: 'I am a Jew, born in Tarsus'"],

  // Bethel
  ["Bethel", "GEN", 28, "Jacob's ladder; 'Surely God is in this place'"],
  ["Bethel", "GEN", 35, "God appears to Jacob again at Bethel"],
  ["Bethel", "1KI", 12, "Jeroboam sets up the golden calf at Bethel"],
  ["Bethel", "AMO", 7, "Amos preaches at Bethel; expelled by priest"],

  // Anathoth
  ["Anathoth", "JER", 1, "The word of the LORD came to Jeremiah of Anathoth"],
  ["Anathoth", "JER", 32, "Jeremiah buys a field in Anathoth while Jerusalem falls"],

  // Tekoa
  ["Tekoa", "AMO", 1, "The words of Amos, who was among the herdsmen of Tekoa"],
  ["Tekoa", "2SA", 14, "The wise woman of Tekoa"],

  // Mamre
  ["Mamre", "GEN", 13, "Abram settles at the oaks of Mamre"],
  ["Mamre", "GEN", 18, "Three visitors; promise of Isaac; Abraham intercedes for Sodom"],

  // Malta
  ["Malta", "ACT", 28, "The shipwreck; the snake; healing of Publius's father"],

  // Cyprus
  ["Cyprus", "ACT", 13, "Barnabas and Paul sail to Cyprus; Sergius Paulus believes"],
  ["Cyprus", "ACT", 15, "Barnabas takes Mark to Cyprus; Paul and Silas go west"],

  // Petra
  ["Petra", "GAL", 1, "Paul goes to Arabia after his conversion — likely this region"],
  ["Petra", "2KI", 14, "Amaziah defeated the Edomites and captured Sela (Petra)"],

  // Tyre
  ["Tyre", "1KI", 5, "Hiram of Tyre supplies cedar and workers for the Temple"],
  ["Tyre", "EZK", 26, "Oracle against Tyre"],
  ["Tyre", "MAT", 15, "Jesus withdraws to the region of Tyre; heals Canaanite woman's daughter"],
  ["Tyre", "ACT", 21, "Paul stops in Tyre on his way to Jerusalem"],

  // Red Sea
  ["Red Sea", "EXO", 14, "Israel crosses the Red Sea; Egyptians drown"],
  ["Red Sea", "EXO", 15, "The Song of Moses after the crossing"],
  ["Red Sea", "HEB", 11, "By faith Israel crossed the Red Sea as on dry land"],

  // Wilderness of Sinai
  ["Wilderness of Sinai", "EXO", 16, "Manna and quail in the wilderness"],
  ["Wilderness of Sinai", "EXO", 17, "Water from the rock at Rephidim"],
  ["Wilderness of Sinai", "NUM", 11, "Israel craves meat; quail sent"],
  ["Wilderness of Sinai", "NUM", 21, "The bronze serpent"],
  ["Wilderness of Sinai", "HEB", 3, "Do not harden your hearts as in the wilderness"],

  // Crete
  ["Crete", "TIT", 1, "Titus left in Crete to appoint elders"],
  ["Crete", "ACT", 27, "Paul's ship stops at Crete; ignored warnings lead to disaster"],

  // Smyrna
  ["Smyrna", "REV", 2, "Letter to Smyrna: 'I know your tribulation and poverty — you are rich'"],

  // Laodicea
  ["Laodicea", "COL", 4, "Give my letter to Laodicea also"],
  ["Laodicea", "REV", 3, "Letter to Laodicea: 'You are neither hot nor cold'"],

  // Pergamon
  ["Pergamon", "REV", 2, "Letter to Pergamum: 'You live where Satan's throne is'"],

  // Iconium
  ["Iconium", "ACT", 14, "Paul and Barnabas preach in Iconium; plot to stone them"],
  ["Iconium", "2TI", 3, "Paul recounts persecutions at Iconium"],

  // Lystra
  ["Lystra", "ACT", 14, "Paul heals a cripple; crowd calls them gods; Paul stoned"],
  ["Lystra", "ACT", 16, "Timothy joins Paul at Lystra"],

  // Troas
  ["Troas", "ACT", 16, "The Macedonian vision — come over and help us"],
  ["Troas", "ACT", 20, "Eutychus falls asleep and falls from the window; Paul restores him"],

  // Berea
  ["Berea", "ACT", 17, "The Bereans examined the scriptures daily"],

  // Capernaum
  ["Caesarea Philippi", "MAT", 16, "Peter's confession: 'You are the Messiah, the Son of the living God'"],
  ["Caesarea Philippi", "MRK", 8, "Jesus asks 'Who do people say I am?'"],
];

// ── Main seed ────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Seeding geographic data ===");

  // Check existing count
  const { count: existingCount } = await supabase
    .from("geographic_locations")
    .select("id", { count: "exact", head: true });

  if ((existingCount ?? 0) > 0) {
    console.log(`geographic_locations already has ${existingCount} rows — skipping.`);
    return;
  }

  // 1. Insert locations
  console.log(`Inserting ${LOCATIONS.length} locations...`);
  const { data: inserted, error: geoErr } = await supabase
    .from("geographic_locations")
    .insert(LOCATIONS.map((l) => ({
      name: l.name,
      alternate_names: l.alternate_names ?? [],
      modern_name: l.modern_name ?? null,
      lat: l.lat,
      lng: l.lng,
      location_type: l.location_type,
      description: l.description,
      significance: l.significance,
    })))
    .select("id, name");

  if (geoErr) {
    console.error("Error inserting locations:", geoErr);
    process.exit(1);
  }

  console.log(`Inserted ${inserted?.length ?? 0} locations.`);

  // Build name → id map
  const nameToId = new Map<string, string>();
  for (const row of (inserted ?? [])) {
    nameToId.set((row as { id: string; name: string }).name, (row as { id: string; name: string }).id);
  }

  // Also fetch existing locations by name in case some were already there
  const { data: allGeo } = await supabase
    .from("geographic_locations")
    .select("id, name");
  for (const row of (allGeo ?? []) as Array<{ id: string; name: string }>) {
    if (!nameToId.has(row.name)) nameToId.set(row.name, row.id);
  }

  // 2. Insert passage_locations
  console.log(`Building ${PASSAGE_LOC.length} passage-location links...`);
  const passageRows = PASSAGE_LOC.flatMap(([locName, book, chapter, note]) => {
    const locationId = nameToId.get(locName);
    if (!locationId) {
      console.warn(`  ⚠ No ID found for location: "${locName}"`);
      return [];
    }
    return [{
      location_id: locationId,
      book,
      chapter,
      context_note: note ?? null,
    }];
  });

  // Insert in batches of 100
  let inserted_pl = 0;
  for (let i = 0; i < passageRows.length; i += 100) {
    const batch = passageRows.slice(i, i + 100);
    const { error } = await supabase.from("passage_locations").insert(batch);
    if (error) {
      console.error(`Batch ${i}-${i + 100} error:`, error.message);
    } else {
      inserted_pl += batch.length;
    }
  }

  console.log(`Inserted ${inserted_pl} passage-location links.`);
  console.log("\n=== Geographic seeding complete ===");
  console.log(`${LOCATIONS.length} locations, ${inserted_pl} passage links`);
}

main().catch(console.error);
