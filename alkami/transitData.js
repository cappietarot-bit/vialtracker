const transits2026 = [
    { date: "JAN 06", key: "venusCazimi", type: "transit" },
    { date: "JAN 20", key: "sunAquarius", type: "transit" },
    { date: "FEB 10", key: "mercuryAquarius", type: "transit" },
    { date: "FEB 18", key: "sunPisces", type: "transit" },
    { date: "FEB 26", key: "mercuryRetrograde", type: "transit" },
    { date: "MAR 20", key: "sunAries", type: "transit" },
    { date: "APR 20", key: "sunTaurus", type: "transit" },
    { date: "APR 26", key: "uranusGemini", type: "transit" },
    { date: "MAY 20", key: "sunGemini", type: "transit" },
    { date: "JUN 21", key: "sunCancer", type: "transit" },
    { date: "JUL 23", key: "sunLeo", type: "transit" },
    { date: "AUG 23", key: "sunVirgo", type: "transit" },
    { date: "SEP 23", key: "sunLibra", type: "transit" },
    { date: "OCT 03", key: "venusRetrograde", type: "transit" },
    { date: "OCT 23", key: "sunScorpio", type: "transit" },
    { date: "NOV 22", key: "sunSagittarius", type: "transit" },
    { date: "DEC 21", key: "sunCapricorn", type: "transit" }
];

const signArchetypes = {
    all: { 
        en: { trait: "universal and evolving", focus: "collective evolution and shared human experience", element: "ether" },
        es: { trait: "universal y en evolución", focus: "evolución colectiva y experiencia humana compartida", element: "éter" }
    },
    aries: { 
        en: { trait: "pioneering and courageous", focus: "personal identity and the fire of new beginnings", element: "fire" },
        es: { trait: "pionero y valiente", focus: "identidad personal y el fuego de los nuevos comienzos", element: "fuego" }
    },
    taurus: { 
        en: { trait: "steady, patient, and sensual", focus: "material security and the grounding beauty of nature", element: "earth" },
        es: { trait: "constante, paciente y sensual", focus: "seguridad material y la belleza terrenal de la naturaleza", element: "tierra" }
    },
    gemini: { 
        en: { trait: "curious, adaptable, and communicative", focus: "intellectual exchange and the web of social connections", element: "air" },
        es: { trait: "curioso, adaptable y comunicativo", focus: "intercambio intelectual y la red de conexiones sociales", element: "aire" }
    },
    cancer: { 
        en: { trait: "nurturing, intuitive, and protective", focus: "emotional foundations and the sanctuary of home", element: "water" },
        es: { trait: "nutricio, intuitivo y protector", focus: "cimientos emocionales y el santuario del hogar", element: "agua" }
    },
    leo: { 
        en: { trait: "expressive, confident, and radiant", focus: "creative self-expression and the warmth of the spotlight", element: "fire" },
        es: { trait: "expresivo, seguro y radiante", focus: "autoexpresión creativa y el calor de los reflectores", element: "fuego" }
    },
    virgo: { 
        en: { trait: "analytical, helpful, and discerning", focus: "daily wellness rituals and the pursuit of practical perfection", element: "earth" },
        es: { trait: "analítico, servicial y discernidor", focus: "rituales de bienestar diario y la búsqueda de la perfección práctica", element: "tierra" }
    },
    libra: { 
        en: { trait: "harmonious, diplomatic, and social", focus: "relational balance and the pursuit of aesthetic justice", element: "air" },
        es: { trait: "armonioso, diplomático y social", focus: "equilibrio relacional y la búsqueda de la justicia estética", element: "aire" }
    },
    scorpio: { 
        en: { trait: "intense, transformative, and deep", focus: "emotional truth and the mysteries of shared resources", element: "water" },
        es: { trait: "intenso, transformador y profundo", focus: "verdad emocional y los misterios de los recursos compartidos", element: "agua" }
    },
    sagittarius: { 
        en: { trait: "adventurous, philosophical, and optimistic", focus: "higher learning and the quest for spiritual expansion", element: "fire" },
        es: { trait: "aventurero, filosófico y optimista", focus: "aprendizaje superior y la búsqueda de la expansión espiritual", element: "fuego" }
    },
    capricorn: { 
        en: { trait: "ambitious, structured, and disciplined", focus: "career legacy and the climb toward public reputation", element: "earth" },
        es: { trait: "ambicioso, estructurado y disciplinado", focus: "legado profesional y el ascenso hacia la reputación pública", element: "tierra" }
    },
    aquarius: { 
        en: { trait: "innovative, humanitarian, and eccentric", focus: "social progress and the shared vision of the future", element: "air" },
        es: { trait: "innovador, humanitario y excéntrico", focus: "progreso social y la visión compartida del futuro", element: "aire" }
    },
    pisces: { 
        en: { trait: "dreamy, compassionate, and mystical", focus: "inner healing and the flow of universal spirituality", element: "water" },
        es: { trait: "soñador, compasivo y místico", focus: "sanación interna y el flujo de la espiritualidad universal", element: "agua" }
    }
};

const transitThemes = {
    sunTaurus: {
        en: "grounding energy, material manifestation, and an appreciation for life's slower rhythms",
        es: "energía de enraizamiento, manifestación material y aprecio por los ritmos más lentos de la vida"
    },
    uranusGemini: {
        en: "sudden intellectual breakthroughs, erratic communication patterns, and rapid technological shifts",
        es: "avances intelectuales repentinos, patrones de comunicación erráticos y cambios tecnológicos rápidos"
    },
    sunAries: {
        en: "vitality, a surge of bold independent action, and the spark of a fresh annual start",
        es: "vitalidad, una oleada de acción independiente audaz y la chispa de un nuevo comienzo anual"
    },
    venusCazimi: {
        en: "heart-centered clarity, the renewal of romantic values, and a bright financial illumination",
        es: "claridad centrada en el corazón, la renovación de los valores románticos y una brillante iluminación financiera"
    },
    mercuryRetrograde: {
        en: "deep internal reflection, the recalibration of technology, and the revisiting of past lessons",
        es: "reflexión interna profunda, la recalibración de la tecnología y la revisión de lecciones pasadas"
    },
    sunPisces: {
        en: "compassionate flow, creative daydreaming, and a softening of spiritual boundaries",
        es: "flujo compasivo, ensueño creativo y un suavizado de los límites espirituales"
    },
    sunLeo: {
        en: "dramatic self-expression, creative warmth, and finding your unique place in the spotlight",
        es: "autoexpresión dramática, calidez creativa y encontrar tu lugar único bajo los reflectores"
    },
    sunAquarius: {
        en: "visionary thinking, social reorganization, and the breaking of outdated traditional molds",
        es: "pensamiento visionario, reorganización social y la ruptura de moldes tradicionales obsoletos"
    },
    mercuryAquarius: {
        en: "brilliant logic, innovative data exchange, and the rapid sharing of humanitarian ideas",
        es: "lógica brillante, intercambio de datos innovador y el intercambio rápido de ideas humanitarias"
    },
    sunGemini: {
        en: "mental agility, social variety, and the lighthearted exploration of diverse viewpoints",
        es: "agilidad mental, variedad social y la exploración alegre de diversos puntos de vista"
    },
    sunCancer: {
        en: "emotional depth, the protection of one's inner world, and a focus on domestic harmony",
        es: "profundidad emocional, protección del mundo interior y enfoque en la armonía doméstica"
    },
    sunVirgo: {
        en: "meticulous organization, the refinement of skills, and an emphasis on bodily health",
        es: "organización meticulosa, refinamiento de habilidades y énfasis en la salud corporal"
    },
    sunLibra: {
        en: "artistic balance, the smoothing over of conflicts, and a focus on fair partnerships",
        es: "equilibrio artístico, suavizado de conflictos y enfoque en asociaciones justas"
    },
    venusRetrograde: {
        en: "the re-evaluation of worth, the return of past lovers, and a pause in financial growth",
        es: "la reevaluación del valor, el regreso de antiguos amantes y una pausa en el crecimiento financiero"
    },
    sunScorpio: {
        en: "psychological intensity, the shedding of old skins, and the search for hidden power",
        es: "intensidad psicológica, desprendimiento de viejas pieles y búsqueda de poder oculto"
    },
    sunSagittarius: {
        en: "the quest for truth, cultural exploration, and the broadening of philosophical horizons",
        es: "la búsqueda de la verdad, exploración cultural y ampliación de horizontes filosóficos"
    },
    sunCapricorn: {
        en: "pragmatic ambition, the building of long-lasting structures, and professional mastery",
        es: "ambición pragmática, construcción de estructuras duraderas y maestría profesional"
    }
};

/* ============================================================
   Hand-written horoscope content for upcoming 2026 transits,
   in Ryan's voice — direct, concrete, grounded in his own
   tarot sign-correspondences rather than generic filler.
   Falls back to generateAdviceTemplate() for any transit/sign
   not covered here (past transits, "all"/collective view).
   ============================================================ */
const horoscopeContent = {
    sunLeo: {
        aries: {
            en: {
                general: ["Leo season hands fire signs an easy head start — less about proving yourself, more about actually enjoying the spotlight for once.", "Your El Loco energy gets a boost this month: whatever you've been circling, this is a good stretch to just start it without waiting for permission."],
                love: ["You flirt best when you're not trying, and this transit knows it — expect more attention than usual, and don't overthink where it's coming from.", "If you're paired up, plan something that lets you both show off a little; competing on the same team keeps this playful instead of prickly."],
                work: ["Reina de Bastos energy is strong right now — you do your best work when it's visible, not quietly grinding in the background.", "Say what you want out loud this month. Leo season rewards the person who actually asks."]
            },
            es: {
                general: ["La temporada de Leo te da ventaja de una vez — no se trata de demostrar nada, se trata de disfrutar los reflectores por una vez sin sentirte raro.", "Tu energía de El Loco se activa este mes: lo que llevas tiempo pensando en empezar, empiézalo ya sin esperar permiso de nadie."],
                love: ["Coqueteas mejor cuando no lo estás intentando, y este tránsito lo sabe — vas a recibir más atención de lo normal, no le busques tanta lógica.", "Si tienes pareja, planeen algo donde los dos puedan lucirse un poco; competir en el mismo equipo mantiene esto divertido y no picajoso."],
                work: ["La energía de Reina de Bastos está fuerte — trabajas mejor cuando se nota, no trabajando calladito en el fondo.", "Di lo que quieres en voz alta este mes. La temporada de Leo premia a quien pregunta."]
            }
        },
        taurus: {
            en: {
                general: ["Leo season turns the volume up on everything, which can feel like a lot for a sign that likes things steady — but it's a good excuse to enjoy something instead of just maintaining it.", "La Emperatriz energy is strong for you right now: this is about abundance, output, actually letting yourself have something nice."],
                love: ["You show love through consistency, and this transit asks you to say it a little louder too — a real compliment, a planned date, something your partner can point to.", "If you're single, don't wait six months to warm up to someone; Leo season moves faster than you'd like, so keep up a little."],
                work: ["Strong month for anything tied to comfort, beauty, or making money from something you're already good at.", "Lean into what you know instead of stretching into someone else's lane right now."]
            },
            es: {
                general: ["La temporada de Leo sube el volumen a todo, y eso puede sentirse pesado para un signo que prefiere lo estable — pero es buena excusa para disfrutar algo en vez de solo mantenerlo.", "La energía de La Emperatriz está fuerte para ti ahorita: se trata de abundancia, de producir, de dejarte tener algo bonito sin culpa."],
                love: ["Muestras amor con constancia, y este tránsito te pide decirlo un poco más alto también — un cumplido real, una cita planeada, algo que tu pareja pueda señalar.", "Si estás soltera/o, no esperes seis meses para calentar con alguien; la temporada de Leo se mueve más rápido de lo que te gustaría, así que síguele el paso."],
                work: ["Buen mes para todo lo relacionado con comodidad, belleza, o ganar dinero de algo que ya se te da bien.", "Enfócate en lo que ya sabes hacer en vez de estirarte hacia el carril de otra persona."]
            }
        },
        gemini: {
            en: {
                general: ["Leo season loves an audience, and you know how to work one — good stretch for anything social, anything that needs you to talk, charm, or connect people who wouldn't normally be in the same room.", "This is momentum you can actually use, not just enjoy."],
                love: ["Los Enamorados energy shows up strong this month — if there's a specific person you keep circling back to in conversation, that's not random.", "Say the actual thing instead of another clever deflection; Leo season doesn't reward hiding behind a joke."],
                work: ["Reina de Espadas — your words carry real weight right now, so use them on purpose.", "Pitches, hard conversations, anything that needs someone to say the true thing clearly: this is your month for it."]
            },
            es: {
                general: ["A la temporada de Leo le encanta un público, y tú sabes cómo trabajar uno — buen momento para todo lo social, todo lo que te pida hablar, encantar, o conectar a gente que normalmente no estaría en el mismo cuarto.", "Este es un impulso que puedes usar de verdad, no solo disfrutar."],
                love: ["La energía de Los Enamorados se siente fuerte este mes — si hay una persona específica que sigue apareciendo en tus conversaciones, eso no es casualidad.", "Di lo que realmente sientes en vez de otra broma para desviar; la temporada de Leo no premia esconderse detrás de un chiste."],
                work: ["Reina de Espadas — tus palabras pesan de verdad ahorita, así que úsalas a propósito.", "Presentaciones, conversaciones difíciles, cualquier cosa que necesite que alguien diga la verdad claramente: este es tu mes."]
            }
        },
        cancer: {
            en: {
                general: ["Leo season sits right after your own, so there's leftover momentum here — El Carro energy, moving fast, except the attention's on someone else's stage this time.", "Let it be; you don't have to compete for the spotlight to keep your foot on the gas."],
                love: ["You're used to being the one who nurtures, and this transit asks something different — let someone take care of you for once, even in a small, obvious way.", "Don't deflect the compliment; actually take it."],
                work: ["Keep the Carro momentum from your own season going, just redirect it toward whatever's actually useful right now instead of whatever feels most comfortable.", "Fast progress is available if you don't second-guess it."]
            },
            es: {
                general: ["La temporada de Leo llega justo después de la tuya, así que todavía tienes impulso — energía de El Carro, avanzando rápido, solo que ahora los reflectores están en el escenario de alguien más.", "Déjalo así; no tienes que competir por la atención para mantener el pie en el acelerador."],
                love: ["Estás acostumbrada/o a ser quien cuida, y este tránsito te pide algo diferente — deja que alguien te cuide a ti por una vez, aunque sea en algo pequeño y obvio.", "No esquives el cumplido; acéptalo de verdad."],
                work: ["Mantén el impulso de El Carro que traes de tu propia temporada, solo redirígelo hacia lo que realmente sirve ahorita en vez de lo más cómodo.", "Hay progreso rápido disponible si no te lo cuestionas tanto."]
            }
        },
        leo: {
            en: {
                general: ["This is your season, plainly — La Fuerza and El Sol both, so use it.", "Whatever you've been quietly wanting attention for, it's finally the right month to actually ask for it instead of hoping someone notices."],
                love: ["El Sol energy — this is about love that feels light and young, not complicated.", "If you're single, you're magnetic right now without trying; if you're paired up, plan something that reminds you both why this is fun."],
                work: ["Rey de Bastos — charisma opens doors this month that effort alone wouldn't.", "Put yourself in the room, say what you're good at out loud, and let people help you the way they're clearly wanting to."]
            },
            es: {
                general: ["Esta es tu temporada, claramente — La Fuerza y El Sol los dos, así que úsala.", "Lo que has querido en silencio que noten, este es finalmente el mes para pedirlo directamente en vez de esperar que alguien se dé cuenta solo."],
                love: ["Energía de El Sol — se trata de un amor que se siente ligero y joven, no complicado.", "Si estás soltera/o, eres un imán ahorita sin ni siquiera intentarlo; si tienes pareja, planeen algo que les recuerde por qué esto es divertido."],
                work: ["Rey de Bastos — el carisma abre puertas este mes que el esfuerzo solo no abriría.", "Ponte en el cuarto, di en voz alta en qué eres bueno/a, y deja que la gente te ayude como claramente quiere hacerlo."]
            }
        },
        virgo: {
            en: {
                general: ["Leo season is loud right before your own quieter one starts, and the contrast is useful — notice what you actually want attention for versus what you're performing just because everyone else is loud right now.", "El Ermitaño energy keeps working quietly in the background even during someone else's season."],
                love: ["You don't need grand gestures to feel loved, but let one happen anyway this month — someone wants to make a bit of a scene about how much they like you, so let them.", "Enjoy it instead of managing it."],
                work: ["Good month to let your actual results speak instead of downplaying them.", "If you've quietly fixed something or carried a project, this is the stretch to mention it before someone else takes the credit."]
            },
            es: {
                general: ["La temporada de Leo es ruidosa justo antes de que empiece la tuya, más tranquila, y ese contraste sirve — fíjate en qué de verdad quieres que noten versus qué solo estás actuando porque todos alrededor están ruidosos ahorita.", "La energía de El Ermitaño sigue trabajando calladita en el fondo aunque sea la temporada de alguien más."],
                love: ["No necesitas gestos grandes para sentirte querida/o, pero deja que pase uno este mes de todos modos — alguien quiere hacer un pequeño escándalo de cuánto le gustas, déjalo.", "Disfrútalo en vez de controlarlo."],
                work: ["Buen mes para dejar que tus resultados hablen en vez de minimizarlos.", "Si arreglaste algo callado o cargaste un proyecto tú solo/a, este es el momento de mencionarlo antes de que alguien más se lleve el crédito."]
            }
        },
        libra: {
            en: {
                general: ["Leo season is generous to you — good for anything social, aesthetic, or relationship-adjacent.", "La Justicia energy asks you to actually take a side this month instead of weighing both forever; a decision you've been sitting on wants to move."],
                love: ["Genuinely good stretch for romance — Leo season plus your comfort zone of people, connection, being seen as a pair.", "If single, don't overthink who asks first."],
                work: ["Caballo de Espadas — quick, clear communication gets you further than another round of careful diplomacy.", "Say the direct thing this month instead of the polite version of it."]
            },
            es: {
                general: ["La temporada de Leo es generosa contigo — buena para todo lo social, lo estético, o lo relacionado con pareja.", "La energía de La Justicia te pide que por fin tomes un lado este mes en vez de seguir pesando los dos para siempre; una decisión que llevas tiempo aplazando quiere moverse."],
                love: ["De verdad buen momento para el romance — la temporada de Leo más tu zona cómoda de gente, conexión, que te vean como pareja.", "Si estás soltera/o, no le pienses tanto a quién da el primer paso."],
                work: ["Caballo de Espadas — comunicación rápida y clara te lleva más lejos que otra ronda de diplomacia cuidadosa.", "Di lo directo este mes en vez de la versión educada de eso."]
            }
        },
        scorpio: {
            en: {
                general: ["Leo's brightness can feel like a lot for a sign that prefers the shadows, but it's a good month to let something end publicly instead of privately.", "La Muerte energy — releasing what's already over, just with witnesses this time."],
                love: ["Rey de Copa — someone in your life has more love for you than they're currently showing, and this transit is a good nudge to actually ask instead of assuming.", "If you're the one holding back, this is the month to stop testing people and just say it."],
                work: ["Good stretch to be visibly good at something instead of quietly indispensable.", "Let one win be loud this month instead of handling it privately like usual."]
            },
            es: {
                general: ["El brillo de Leo puede sentirse pesado para un signo que prefiere las sombras, pero es buen mes para dejar que algo termine en público en vez de en privado.", "Energía de La Muerte — soltar lo que ya se acabó, solo que esta vez con testigos."],
                love: ["Rey de Copa — alguien en tu vida tiene más amor por ti del que está mostrando ahorita, y este tránsito es buen empujón para preguntar en vez de asumir.", "Si eres tú quien se está conteniendo, este es el mes para dejar de probar a la gente y simplemente decirlo."],
                work: ["Buen momento para ser visiblemente bueno/a en algo en vez de solo indispensable en silencio.", "Deja que un logro sea ruidoso este mes en vez de manejarlo en privado como siempre."]
            }
        },
        sagittarius: {
            en: {
                general: ["Leo season is easy, warm fire-sign energy for you — good month for actually enjoying yourself instead of turning everything into a lesson or a trip.", "La Templanza asks for just enough moderation that you don't burn out the fun by overdoing it."],
                love: ["Caballo de Bastos — someone's about to offer you something real, not just a fling; the question is whether you can sit still long enough to take it seriously.", "Don't run from a good thing just because it feels like it might ask something of you."],
                work: ["Good month for anything that involves teaching, traveling, or convincing a room of people.", "Your natural confidence is well-supported right now — use it on something that actually matters to you."]
            },
            es: {
                general: ["La temporada de Leo es energía fácil y cálida de fuego para ti — buen mes para de verdad disfrutar en vez de convertir todo en lección o viaje.", "La Templanza pide solo la moderación necesaria para que no quemes la diversión por exagerar."],
                love: ["Caballo de Bastos — alguien está a punto de ofrecerte algo real, no solo algo pasajero; la pregunta es si puedes quedarte quieto/a el tiempo suficiente para tomarlo en serio.", "No huyas de algo bueno solo porque se siente como que te va a pedir algo."],
                work: ["Buen mes para todo lo que involucre enseñar, viajar, o convencer a un cuarto lleno de gente.", "Tu confianza natural está bien apoyada ahorita — úsala en algo que de verdad te importe."]
            }
        },
        capricorn: {
            en: {
                general: ["Leo season's spotlight energy is a little foreign to you, and that's exactly why it's useful.", "El Diablo energy this month is about noticing where you're overgiving and pulling some of that focus back to yourself."],
                love: ["You show love by doing, and that's real — but this transit wants you to also just say something out loud for once.", "A direct compliment lands harder right now than another quietly handled favor."],
                work: ["Good month to actually claim credit for the structure you've built instead of letting it run silently in the background.", "Say what you did."]
            },
            es: {
                general: ["La energía de reflectores de la temporada de Leo se siente un poco ajena para ti, y por eso mismo es útil.", "La energía de El Diablo este mes se trata de notar dónde estás dando de más y regresar un poco de ese enfoque hacia ti."],
                love: ["Muestras amor haciendo cosas, y eso es real — pero este tránsito te pide que también digas algo en voz alta por una vez.", "Un cumplido directo pesa más ahorita que otro favor manejado en silencio."],
                work: ["Buen mes para de verdad reclamar el crédito de la estructura que construiste en vez de dejar que corra en silencio en el fondo.", "Di lo que hiciste."]
            }
        },
        aquarius: {
            en: {
                general: ["Leo is your opposite sign, so this season puts a mirror up.", "La Estrella energy asks you to get comfortable being looked at instead of always being the one observing from slightly outside the group."],
                love: ["Rey de Espadas — use the actual evidence in front of you instead of the story you've built in your head about how this person feels.", "If someone's shown up consistently, believe it."],
                work: ["Good month for anything that needs you to be the face of an idea instead of just the mind behind it.", "Step up front for once."]
            },
            es: {
                general: ["Leo es tu signo opuesto, así que esta temporada te pone un espejo enfrente.", "La energía de La Estrella te pide sentirte cómodo/a siendo observado/a en vez de siempre ser quien observa un poco afuera del grupo."],
                love: ["Rey de Espadas — usa la evidencia real que tienes enfrente en vez de la historia que armaste en tu cabeza sobre cómo se siente esta persona.", "Si alguien ha estado presente de forma constante, créelo."],
                work: ["Buen mes para todo lo que te necesite como la cara de una idea y no solo la mente detrás de ella.", "Ponte al frente por una vez."]
            }
        },
        pisces: {
            en: {
                general: ["Leo season's brightness is a good counterbalance to your usual fog.", "La Luna still rules your instincts, but this month, let yourself actually be seen enjoying something instead of processing it quietly from the corner."],
                love: ["Trust the pull you feel toward someone even if you can't fully explain it yet — La Luna energy is strong, and your gut is ahead of your logic here.", "Let romance be a little dramatic this month; it's allowed."],
                work: ["Good stretch for anything creative that you'd normally keep private.", "Leo season wants your art, your ideas, your quieter talents actually out where people can see them."]
            },
            es: {
                general: ["El brillo de la temporada de Leo es buen contrapeso para tu neblina de siempre.", "La Luna sigue gobernando tus instintos, pero este mes, déjate ver disfrutando algo en vez de procesarlo en silencio desde la esquina."],
                love: ["Confía en el jalón que sientes hacia alguien aunque todavía no lo puedas explicar del todo — la energía de La Luna está fuerte, y tu instinto va adelante de tu lógica aquí.", "Deja que el romance sea un poco dramático este mes; está permitido."],
                work: ["Buen momento para algo creativo que normalmente mantendrías privado.", "La temporada de Leo quiere tu arte, tus ideas, tus talentos más callados, de verdad afuera donde la gente los pueda ver."]
            }
        }
    },
    sunVirgo: {},
    sunLibra: {},
    venusRetrograde: {},
    sunScorpio: {},
    sunSagittarius: {},
    sunCapricorn: {}
};

function generateAdvice(signKey, transitKey) {
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
    const curated = horoscopeContent[transitKey] && horoscopeContent[transitKey][signKey];
    if (curated) {
        return curated[lang] || curated.en;
    }
    return generateAdviceTemplate(signKey, transitKey, lang);
}

function generateAdviceTemplate(signKey, transitKey, lang) {
    const signData = signArchetypes[signKey] || signArchetypes.all;
    const sign = signData[lang];
    const themeData = transitThemes[transitKey] || { en: "a unique celestial alignment", es: "una alineación celestial única" };
    const theme = themeData[lang];
    
    const signName = signKey === 'all' ? (lang === 'en' ? "the collective" : "el colectivo") : translations[lang].signs[signKey];

    if (lang === 'es') {
        return {
            general: `Para ti, ${signName}, el ciclo actual de ${theme} activa tu espíritu inherentemente ${sign.trait} de formas profundas. Mientras los planetas se alinean en esta configuración específica, se te invita a enfocarte profundamente en ${sign.focus}, permitiendo que la energía cósmica guíe tu evolución personal durante las próximas semanas. Es posible que sientas una atracción persistente hacia tu naturaleza de ${sign.element}, buscando un equilibrio delicado entre las demandas externas y tu verdad interior más auténtica. Este viaje no debe apresurarse; más bien, es una meditación de cinco a seis oraciones sobre cómo te mantienes en tu poder mientras el mundo cambia a tu alrededor. Mantente enraizado en tus valores fundamentales, pero permanece abierto a los sutiles susurros del universo mientras revelan tu próximo paso lógico. Confía en que cualquier fricción que experimentes ahora es simplemente una herramienta para pulir las facetas más brillantes de tu alma.`,
            love: `En el ámbito de las relaciones, este período de ${theme} destaca cómo navegas ${sign.focus} con las personas más cercanas a tu corazón. Tu enfoque ${sign.trait} hacia la conexión emocional será probado y refinado, ofreciendo una ventana rara para una sanación y un crecimiento profundos. Utiliza este tiempo para comunicarte con absoluta transparencia, asegurando que tus necesidades más profundas sean satisfechas mientras honras el flujo de ${sign.element} de tu asociación. Si te encuentras soltero, las estrellas sugieren que atraer a un espíritu afín requiere que irradies tu verdadera esencia de ${sign.element} sin vacilaciones ni máscaras. El amor no es simplemente un sentimiento pasajero durante este tránsito; es una práctica espiritual transformadora que exige tu presencia e intencionalidad plenas. Al abrir tu corazón a lo inesperado, permites que el universo reescriba tu narrativa romántica de maneras que nunca pensaste posibles.`,
            work: `Profesionalmente, ${signName}, la afluencia de ${theme} proporciona una lente nítida a través de la cual reexaminar ${sign.focus}. Tu ética de trabajo ${sign.trait} será tu mayor activo mientras navegas por prioridades cambiantes y aprovechas nuevas oportunidades para el avance material y espiritual. Es esencial mantener un enfoque constante en la estructura a largo plazo de tu carrera mientras permaneces lo suficientemente flexible para adaptarte a cualquier cambio impulsado por el ${sign.element} en el mercado. Este ciclo te anima a buscar empresas colaborativas que se alineen con tus valores fundamentales y apoyen el legado que deseas dejar atrás. No rehuyas el trabajo duro necesario para manifestar tus visiones, ya que la energía de este tránsito apoya a quienes toman acciones disciplinadas. Para cuando este movimiento celestial concluya, poseerás una comprensión mucho más clara de cómo ${sign.focus} sirve a tu destino profesional final.`
        };
    }

    return {
        general: `For you, ${signName}, the current cycle of ${theme} activates your inherently ${sign.trait} spirit in profound ways. As the planets align in this specific configuration, you are invited to focus deeply on ${sign.focus}, allowing the cosmic energy to guide your personal evolution through the coming weeks. You may feel a persistent pull toward your ${sign.element} nature, seeking a delicate balance between external demands and your most authentic inner truth. This journey is not one to be rushed; rather, it is a five-to-six sentence meditation on how you stand in your power while the world shifts around you. Remain grounded in your core values yet stay open to the subtle whispers of the universe as they reveal your next logical step. Trust that any friction you experience now is merely a tool for polishing the most brilliant facets of your soul.`,
        love: `In the realm of relationships, this period of ${theme} highlights how you navigate ${sign.focus} with those closest to your heart. Your ${sign.trait} approach to emotional connection will be both tested and refined, offering a rare window for profound healing and growth. Use this time to communicate with absolute transparency, ensuring that your deepest needs are met while you honor the ${sign.element} flow of your partnership. If you find yourself single, the stars suggest that attracting a kindred spirit requires you to radiate your true ${sign.element} essence without hesitation or mask. Love is not merely a passing feeling during this transit; it is a transformative spiritual practice that demands your full presence and intentionality. By opening your heart to the unexpected, you allow the universe to rewrite your romantic narrative in ways you never thought possible.`,
        work: `Professionally, ${signName}, the influx of ${theme} provides a sharp lens through which to re-examine your ${sign.focus}. Your ${sign.trait} work ethic will be your greatest asset as you navigate shifting priorities and seize new opportunities for material and spiritual advancement. It is essential to maintain a steady focus on the long-term structure of your career while remaining flexible enough to adapt to any ${sign.element}-driven changes in the market. This cycle encourages you to seek out collaborative ventures that align with your core values and support the legacy you wish to leave behind. Do not shy away from the hard work required to manifest your visions, for the energy of this transit supports those who take disciplined action. By the time this celestial movement concludes, you will possess a much clearer understanding of how your ${sign.focus} serves your ultimate professional destiny.`
    };
}
