// --- DEBUG ERROR HANDLER ---
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error("Alkami Error:", msg, "at", url, ":", lineNo);
    return false;
};

// --- AURORA SKIN: animated nebula canvas (natal page only) ---
const Aurora = (function () {
    let canvas, ctx, running = false, rafId = null, W = 0, H = 0;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function mulberry32(a) {
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    let clumps = [], dust = [], stars = [], constellationPts = [];

    function buildScene() {
        const rand = mulberry32(20260709);
        const hues = [[120, 95, 210], [206, 120, 160], [90, 150, 190], [150, 90, 190]];
        clumps = [];
        hues.forEach((rgb) => {
            const cx = rand() * W, cy = rand() * H * 0.7;
            const puffs = 14 + Math.floor(rand() * 10);
            for (let i = 0; i < puffs; i++) {
                clumps.push({
                    baseX: cx + (rand() - 0.5) * W * 0.55,
                    baseY: cy + (rand() - 0.5) * H * 0.4,
                    r: 30 + rand() * 70, rgb,
                    alpha: 0.05 + rand() * 0.09,
                    phase: rand() * Math.PI * 2,
                    speed: 0.15 + rand() * 0.15
                });
            }
        });
        dust = [];
        for (let d = 0; d < 260; d++) {
            dust.push({ x: rand() * W, y: rand() * H, r: rand() * 1.1 + 0.2, a: rand() * 0.35 + 0.05 });
        }
        stars = [];
        for (let s = 0; s < 70; s++) {
            stars.push({
                x: rand() * W, y: rand() * H * 0.85, r: rand() * 1.3 + 0.5,
                phase: rand() * Math.PI * 2, speed: 0.6 + rand() * 1.1, bright: 0.5 + rand() * 0.5
            });
        }
        const upper = stars.filter(st => st.y < H * 0.32).sort((a, b) => a.x - b.x);
        constellationPts = [];
        for (let c = 0; c < upper.length; c += Math.max(1, Math.floor(upper.length / 6))) {
            constellationPts.push(upper[c]);
        }
    }

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        buildScene();
    }

    function drawFrame(t) {
        ctx.clearRect(0, 0, W, H);
        const base = ctx.createLinearGradient(0, 0, 0, H);
        base.addColorStop(0, '#181030'); base.addColorStop(0.55, '#100b22'); base.addColorStop(1, '#09071500');
        ctx.fillStyle = '#0a0716'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);

        ctx.globalCompositeOperation = 'screen';
        clumps.forEach((p) => {
            const drift = reduceMotion ? 0 : Math.sin(t * 0.00006 * p.speed + p.phase) * 14;
            const x = p.baseX + drift, y = p.baseY + drift * 0.6;
            const g = ctx.createRadialGradient(x, y, 0, x, y, p.r);
            g.addColorStop(0, 'rgba(' + p.rgb.join(',') + ',' + p.alpha + ')');
            g.addColorStop(1, 'rgba(' + p.rgb.join(',') + ',0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';

        dust.forEach((pt) => {
            ctx.fillStyle = 'rgba(230,220,255,' + pt.a + ')';
            ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
        });

        if (constellationPts.length > 1) {
            ctx.beginPath();
            constellationPts.forEach((pt, i) => { i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y); });
            const lg = ctx.createLinearGradient(constellationPts[0].x, 0, constellationPts[constellationPts.length - 1].x, 0);
            lg.addColorStop(0, 'rgba(243,217,152,0.7)'); lg.addColorStop(1, 'rgba(132,120,161,0.5)');
            ctx.strokeStyle = lg; ctx.lineWidth = 0.7; ctx.stroke();
        }

        stars.forEach((st) => {
            const tw = reduceMotion ? st.bright : st.bright * (0.55 + 0.45 * Math.sin(t * 0.0016 * st.speed + st.phase));
            if (st.r > 1.2) {
                ctx.fillStyle = 'rgba(243,217,152,' + (tw * 0.22) + ')';
                ctx.beginPath(); ctx.arc(st.x, st.y, st.r * 3, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = 'rgba(255,250,235,' + tw + ')';
            ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
        });
    }

    function loop(t) {
        if (!running) return;
        drawFrame(t);
        rafId = reduceMotion ? null : requestAnimationFrame(loop);
    }

    function ensureInit() {
        if (canvas) return true;
        canvas = document.getElementById('aurora-bg-canvas');
        if (!canvas) return false;
        try {
            ctx = canvas.getContext('2d');
        } catch (e) {
            console.error('Aurora canvas init failed', e);
            return false;
        }
        window.addEventListener('resize', () => { if (running) resize(); });
        return true;
    }

    function show() {
        if (!ensureInit()) return;
        if (!running) {
            running = true;
            canvas.style.display = 'block';
            resize();
            loop(0);
        }
    }

    function hide() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        if (canvas) canvas.style.display = 'none';
    }

    return { show, hide };
})();

window.setSkin = function (skin) {
    localStorage.setItem('alkami_skin', skin);
    document.body.classList.toggle('aurora-skin', skin === 'aurora');
    document.querySelectorAll('.skin-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.skin === skin);
    });
    if (skin === 'aurora') Aurora.show(); else Aurora.hide();
};

// --- STATE & CONSTANTS ---
const translations = {
    en: {
        newsTitle: "Today's Horoscope",
        psychicTitle: "Elite Guides",
        tarotTitle: "The Oracle",
        booksTitle: "Must Reads",
        profileTitle: "Astral Profile",
        filterLabel: "Your Zodiac Sign:",
        drawAgain: "Draw Again",
        connecting: "Connecting with {name}...",
        reversed: "Reversed",
        navHoroscope: "Horoscope",
        navTarot: "Tarot",
        navNatal: "Natal",
        navBooks: "Books",
        navPsychics: "Psychics",
        welcome: "Welcome, {name}",
        memberSince: "Member since:",
        natalSigns: "The Big Three",
        sunSign: "Sun",
        moonSign: "Moon",
        ascSign: "Rising",
        socialLinks: "Connections",
        googleBtn: "Sign in with Google",
        achievementsTitle: "Cosmic Milestones",
        saveBtn: "Save Profile",
        selectSign: "Select",
        adviceGeneral: "General",
        adviceLove: "Love",
        adviceCareer: "Career",
        chatNow: "Chat Now",
        watchVideo: "Watch",
        signs: {
            aries: "Aries", taurus: "Taurus", gemini: "Gemini", cancer: "Cancer",
            leo: "Leo", virgo: "Virgo", libra: "Libra", scorpio: "Scorpio",
            sagittarius: "Sagittarius", capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces"
        }
    },
    es: {
        newsTitle: "Horóscopo de Hoy",
        psychicTitle: "Guías de Élite",
        tarotTitle: "El Oráculo",
        booksTitle: "Lecturas Recomendadas",
        profileTitle: "Perfil Astral",
        filterLabel: "Tu Signo:",
        drawAgain: "Echar de Nuevo",
        connecting: "Conectando con {name}...",
        reversed: "Invertida",
        navHoroscope: "Horóscopo",
        navTarot: "Tarot",
        navNatal: "Natal",
        navBooks: "Libros",
        navPsychics: "Psíquicos",
        welcome: "Bienvenido, {name}",
        memberSince: "Miembro desde:",
        natalSigns: "Los Tres Grandes",
        sunSign: "Sol",
        moonSign: "Luna",
        ascSign: "Ascendente",
        socialLinks: "Conexiones",
        googleBtn: "Iniciar sesión con Google",
        achievementsTitle: "Logros Cósmicos",
        saveBtn: "Guardar Perfil",
        selectSign: "Seleccionar",
        adviceGeneral: "General",
        adviceLove: "Amor",
        adviceCareer: "Trabajo",
        chatNow: "Chatear",
        watchVideo: "Ver",
        signs: {
            aries: "Aries", taurus: "Tauro", gemini: "Géminis", cancer: "Cáncer",
            leo: "Leo", virgo: "Virgo", libra: "Libra", scorpio: "Escorpio",
            sagittarius: "Sagitario", capricorn: "Capricornio", aquarius: "Acuario", pisces: "Piscis"
        }
    }
};

let currentLang = localStorage.getItem('alkami_lang') || 'en';
let currentTransitIndex = 0;
let currentUser = null;

const psychics = [
    { 
        name: "Cappietarot", 
        specialty: { en: "The Oracle", es: "El Oráculo" }, 
        image: "https://sc02.alicdn.com/kf/Ae6bef514968e4fc5b4ec22522b35c5f6R.png",
        video: "https://www.tiktok.com/@cappietarot",
        bio: { 
            en: "UGC Creator and Master of Tarot with over 5,000 videos and 100M+ views. Expert in manifestation and divine timing.", 
            es: "Creador de UGC y Maestro del Tarot con más de 5,000 videos y 100M+ de vistas. Experto en manifestación y tiempo divino." 
        }
    },
    { 
        name: "Mercy", 
        specialty: { en: "Psychic Healer", es: "Sanadora Psíquica" }, 
        image: "https://sc02.alicdn.com/kf/A381ff89cf0f74b2d9909e9f5377c62bep.png",
        video: "https://www.tiktok.com/@mercymetarot",
        bio: { 
            en: "Mercy from Canada. Psychic Healer and Coach specializing in soulmate connections and manifestation.", 
            es: "Mercy de Canadá. Sanadora Psíquica y Coach especializada en conexiones de almas gemelas y manifestación." 
        }
    },
    { 
        name: "Rachel Rose", 
        specialty: { en: "Spiritual Guide", es: "Guía Espiritual" }, 
        image: "https://sc02.alicdn.com/kf/A2a24af127e0d43c69e3c476698eacc89k.png",
        video: "https://www.tiktok.com/@officialrachrose20",
        bio: { 
            en: "Rachel from Washington. Spiritual guide focusing on the power of prayer, manifestation, and emotional healing.", 
            es: "Rachel de Washington. Guía espiritual enfocada en el poder de la oración, la manifestación y la sanación emocional." 
        }
    },
    { 
        name: "Soul Vanity", 
        specialty: { en: "Intuitive Tarot", es: "Tarot Intuitivo" }, 
        image: "https://sc02.alicdn.com/kf/Aae757a68193b4b20ac5c757f0436015ev.png",
        video: "https://www.tiktok.com/@soulvanity",
        bio: { 
            en: "Rachel from Texas. Intuitive Tarot reader specializing in uncovering spiritual paths and life guidance.", 
            es: "Rachel de Texas. Lectora de Tarot intuitiva especializada en descubrir caminos espirituales y guía de vida." 
        }
    }
];

const zodiacSigns = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

const achievementsList = [
    { id: 'first_horoscope', icon: '♈', en: 'First Insight', es: 'Primera Visión', desc: { en: 'Check your first horoscope.', es: 'Consulta tu primer horóscopo.' } },
    { id: 'first_tarot', icon: '🃏', en: 'Oracle\'s Path', es: 'Camino del Oráculo', desc: { en: 'Draw your first tarot card.', es: 'Echa tu primera carta del tarot.' } },
    { id: 'profile_master', icon: '🗺️', en: 'Self Discovery', es: 'Auto Descubrimiento', desc: { en: 'Complete your astral profile.', es: 'Completa tu perfil astral.' } },
    { id: 'mystic_regular', icon: '🔮', en: 'Mystic Regular', es: 'Místico Regular', desc: { en: 'Open the app 3 days in a row.', es: 'Abre la aplicación 3 días seguidos.' } },
    { id: 'google_linked', icon: '🔗', en: 'Cosmic Account', es: 'Cuenta Cósmica', desc: { en: 'Link your Google account.', es: 'Vincula tu cuenta de Google.' } }
];

// --- PUNCHY, PERSONAL ASTROLOGY INTERPRETATION DATA ---
const planetData = {
    "Sun": { name: "Sun", glyph: "🌞", governs: "core identity, life purpose, and creative spark" },
    "Moon": { name: "Moon", glyph: "🌙", governs: "emotional landscape, intuition, and inner world" },
    "Ascendant": { name: "Ascendant", glyph: "🌅", governs: "outer persona, life approach, and physical vitality" },
    "Mercury": { name: "Mercury", glyph: "☿️", governs: "intellect, communication, and processing of thoughts" },
    "Venus": { name: "Venus", glyph: "♀️", governs: "love, relationships, values, and abundance" },
    "Mars": { name: "Mars", glyph: "♂️", governs: "drive, ambition, passion, and physical action" },
    "Jupiter": { name: "Jupiter", glyph: "🪐", governs: "expansion, higher wisdom, luck, and spiritual growth" },
    "Saturn": { name: "Saturn", glyph: "🪐", governs: "structure, discipline, mastery, and life lessons" },
    "Uranus": { name: "Uranus", glyph: "🪐", governs: "individuality, awakening, revolution, and lightning-fast insights" },
    "Neptune": { name: "Neptune", glyph: "🪐", governs: "mysticism, dreams, spiritual connection, and the collective subconscious" },
    "Pluto": { name: "Pluto", glyph: "🪐", governs: "regeneration, shadow alchemy, truth, and profound soul power" }
};

const interpretationsDb = {
    "Aries": {
        sun: "You are bold, pioneering, and fiercely independent. Your strength is your absolute courage to initiate fresh paths and act with zero hesitation. Your weakness is an impulsive temper and a tendency to leave projects half-finished when the initial spark fades.",
        moon: "You process feelings instantly and intensely, needing physical or active outlets for your emotions. You are emotionally honest and vulnerable, but you can be impatient, easily irritated, and highly defensive when you feel threatened.",
        mercury: "You speak with direct, unfiltered honesty and make decisions in a flash. While you are brilliant at initiating brainstorms, you easily lose interest in long, repetitive details and hate beat-around-the-bush explanations.",
        venus: "In love, you thrive on the excitement of the chase and need passionate stimulation. You are a bold and spontaneous partner, but you can become restless if a relationship feels too comfortable, predictable, or routine.",
        mars: "Your drive and sexual energy are fiery, direct, and highly enthusiastic. You pursue what you desire with absolute confidence, craving physical excitement, but your energy can burn out quickly if you aren't constantly challenged.",
        outer: "Your soul lessons revolve around learning to lead with courage while keeping your impatient ego in check. Growth comes from building discipline without losing your bold, pioneering spark."
    },
    "Taurus": {
        sun: "You are grounded, patient, and highly practical. Your strength is your steady consistency and your ability to bring stability to any situation. Your weakness is an intense stubbornness and a strong resistance to changes that disrupt your comfort.",
        moon: "You seek emotional safety in physical comfort, predictable routines, and financial stability. You are a rock of calm reliability during crises, but your shadow side is a tendency to hoard emotions and resist necessary closures.",
        mercury: "You process ideas slowly, deliberately, and with a focus on practical utility. You speak with calm authority, but you can be incredibly closed-minded once you have made up your mind on a topic.",
        venus: "You crave deep, physical, and long-term security in your relationships. You express love through sensual touch, loyalty, and material gifts, but you can become possessive and struggle to let go of dead-end dynamics.",
        mars: "Your sexual energy is slow, sensual, and highly physical. You have immense stamina and pursue your goals with quiet, unstoppable persistence, though you can struggle with laziness and procrastination.",
        outer: "Your soul lessons challenge you to find security within yourself rather than relying solely on material possessions. Growth comes from learning to flow with life's natural cycles of change."
    },
    "Gemini": {
        sun: "You are intellectually curious, versatile, and highly sociable. Your strength is your rapid adaptability and your talent for connecting people and ideas. Your weakness is mental restlessness, distractibility, and spreading yourself too thin.",
        moon: "You process your feelings intellectually, wanting to talk through or analyze your emotions rather than just feeling them. While you are highly adaptable, you can use witty humor as a defense mechanism to avoid deep emotional intimacy.",
        mercury: "Your mind is lightning-fast, constantly seeking fresh information and mental stimulation. You are an engaging conversationalist and master networker, but your thoughts can easily become scattered or anxious.",
        venus: "You need a deep intellectual connection and playful variety in romance. You are attracted to witty, spontaneous partners, and you easily shut down if a relationship becomes emotionally heavy, routine, or silent.",
        mars: "Your sexual energy is playful, communicative, and driven by mental fantasy. You crave intellectual chemistry and verbal foreplay as much as physical connection, though your focus can be highly restless.",
        outer: "Your soul lessons focus on moving from scattered information to deep, authentic wisdom. Growth comes from learning to quiet your busy mind and focus your immense intellectual energy."
    },
    "Cancer": {
        sun: "You are deeply nurturing, intuitive, and protective. Your strength is your profound emotional intelligence and your ability to create a safe sanctuary for others. Your weakness is a highly defensive sensitivity and a tendency to cling to the past.",
        moon: "Your inner world is deeply sensitive and highly intuitive. You absorb the emotional energy of any room you enter, and while you are incredibly caring, your defensive shadow makes you retreat into a moody, protective shell when hurt.",
        mercury: "You think and communicate through your feelings and gut instincts rather than cold logic. You have a brilliant memory for stories and personal details, but you can easily take things too personally.",
        venus: "In relationships, you are deeply devoted, nurturing, and seek absolute emotional safety. You express love by creating a cozy home and protecting your partner, but you can easily smother them or use emotional guilt when insecure.",
        mars: "Your passion is quiet, defensive, and deeply protective of your loved ones. Sexually, you crave deep emotional intimacy and a sense of trust; without a heart connection, your sexual drive quickly retreats.",
        outer: "Your soul lessons challenge you to build strong emotional boundaries so you don't drown in others' feelings. Growth comes from learning to trust your intuition without retreating into defensive shells."
    },
    "Leo": {
        sun: "You are radiant, creative, and proudly honorable. Your strength is your warm generosity and your natural ability to inspire others. Your weakness is a fragile pride that seeks constant external validation and attention.",
        moon: "You need to feel special, appreciated, and emotionally celebrated. Your emotional strength is a massive, warm heart and fierce loyalty, but your shadow is a tendency to dramatize feelings and take offense easily.",
        mercury: "You communicate with dramatic flair, passion, and creative expression. You are a natural-born storyteller and leader, but you can struggle to listen to other perspectives when your pride is involved.",
        venus: "You want a romance that feels like a cinematic adventure, full of grand gestures and public pride. You are incredibly loyal, playful, and generous with your partner, but you can become dramatic if you feel ignored.",
        mars: "Your passion and sexual energy are dramatic, expressive, and highly passionate. You love to feel desired and bring a playful, creative fire to the bedroom, though your ego can easily get bruised if your performance isn't praised.",
        outer: "Your soul lessons challenge you to find your true validation from within your own heart rather than seeking it from an audience. Growth comes from leading with pure, selfless generosity."
    },
    "Virgo": {
        sun: "You are highly analytical, dedicated, and refined. Your strength is your precise attention to detail and your deep desire to be of practical service. Your weakness is a critical inner voice and a tendency to worry excessively.",
        moon: "You seek emotional calm by organizing your life and being practically useful. While you are deeply caring and show love through acts of service, your emotional shadow is a constant anxiety and a tendency to over-analyze your feelings.",
        mercury: "Your mind is highly precise, organized, and brilliant at problem-solving. You speak with clear, refined accuracy, but you can easily get bogged down in trivial details and miss the bigger picture.",
        venus: "You show love through quiet acts of service, support, and practical helpfulness. You are a deeply loyal and dedicated partner, but your weakness is a tendency to criticize your partner's flaws or overthink the relationship.",
        mars: "Your sexual energy is refined, observant, and highly attentive to your partner's pleasure. You pursue your goals with quiet, organized dedication, though your drive can be paralyzed by perfectionism.",
        outer: "Your soul lessons challenge you to silence your critical inner judge and accept yourself as you are. Growth comes from understanding that perfection is an illusion, but your helpful spirit is real."
    },
    "Libra": {
        sun: "You are harmonious, diplomatic, and deeply relational. Your strength is your graceful ability to bridge conflicts and create beautiful aesthetic balance. Your weakness is a chronic indecisiveness and a fear of confronting necessary friction.",
        moon: "You need peace, balance, and partnership to feel emotionally safe. Your emotional strength is your graceful diplomacy, but your shadow side is a tendency to people-please and suppress your true feelings to avoid rocking the boat.",
        mercury: "You think and communicate with tact, fairness, and a desire to see all sides of an issue. While you are a brilliant diplomat, you can drive yourself crazy trying to make a simple, balanced decision.",
        venus: "In romance, you are a true idealist who craves aesthetic beauty, harmony, and equal partnership. You love dating and connection, but your weakness is a tendency to ignore red flags just to keep the relationship peaceful.",
        mars: "Your drive and sexual energy are artistic, romantic, and highly relational. You crave mutual pleasure, harmony, and aesthetic atmosphere in the bedroom, though you can struggle to take bold, aggressive action.",
        outer: "Your soul lessons challenge you to find your own independent voice even when it disrupts superficial peace. Growth comes from learning that true harmony requires raw, honest truth."
    },
    "Scorpio": {
        sun: "You are intense, magnetic, and deeply transformative. Your strength is your absolute emotional resilience and your ability to see through any superficial lies. Your weakness is a tendency toward jealousy, secrecy, and a desire for control.",
        moon: "Your emotional world is incredibly deep, private, and intensely passionate. You seek complete soul-level intimacy and are fiercely protective, but your shadow is a tendency to hold onto grudges and remain suspicious of others.",
        mercury: "Your mind works like an investigator, scanning every situation for hidden motives and absolute truth. You speak with powerful, punchy precision, but you can be highly secretive and suspicious of others' ideas.",
        venus: "You crave an all-consuming, intense, and deeply spiritual soul connection in love. Your loyalty is absolute and fiercely protective, but your shadow side is a tendency toward jealousy, possessiveness, and emotional power struggles.",
        mars: "Your sexual energy is magnetic, intense, and deeply passionate. You crave raw, powerful intimacy and vulnerability in the bedroom, pursuing your desires with a quiet, relentless determination that never gives up.",
        outer: "Your soul lessons challenge you to release the urge to control external outcomes and open your heart to trust. Growth comes from transforming your intense pain into profound spiritual power."
    },
    "Sagittarius": {
        sun: "You are expansive, philosophical, and adventure-seeking. Your strength is your wedding optimism and your love for absolute freedom. Your weakness is a restless impatience, a lack of tact, and a tendency to avoid responsibilities.",
        moon: "You need freedom, optimism, and constant exploration to feel emotionally safe. You process feelings by looking at the bigger picture and seeking adventure, but your shadow is an emotional restlessness that runs from heavy feelings.",
        mercury: "You think in grand, philosophical terms, speaking with raw, unfiltered honesty. While you are an inspiring teacher and visionary, you can easily overlook important details and blunt your words without tact.",
        venus: "You view love as a grand adventure and need complete freedom to roam. You are attracted to spontaneous and open-minded partners, but you will quickly run if a relationship feels possessive, jealous, or highly predictable.",
        mars: "Your sexual energy is playful, adventurous, and highly spontaneous. You crave physical exploration, fun, and a deep mental connection, though your passion can be restless, always seeking the next exciting horizon.",
        outer: "Your soul lessons challenge you to ground your grand philosophical ideas into practical daily steps. Growth comes from exploring the world while remaining committed to your responsibilities."
    },
    "Capricorn": {
        sun: "You are disciplined, ambitious, and highly authoritative. Your strength is your structured effort and your ability to build a long-term legacy. Your weakness is a cold emotional distance and an obsession with success and control.",
        moon: "You seek emotional safety in structure, practical results, and financial control. You are a rock of reliability under pressure, but your shadow is a habit of hiding your vulnerability behind a wall of duty and emotional restraint.",
        mercury: "You think and communicate with structured, realistic, and highly practical focus. You speak with calm, business-like authority, but you can be highly resistant to unconventional or risky ideas.",
        venus: "You take love deeply seriously and seek a stable, respectable, and long-term partnership. You show love through loyalty and building material security, but you can struggle to express raw, spontaneous affection.",
        mars: "Your sexual energy is controlled, powerful, and highly sensual. You have immense physical stamina and pursue your ambitions with disciplined focus, though you can treat intimacy as another task to master.",
        outer: "Your soul lessons challenge you to soften your emotional control and realize your worth isn't tied to your productivity. Growth comes from letting vulnerability enrich your life."
    },
    "Aquarius": {
        sun: "You are visionary, rebellious, and fiercely unique. Your strength is your progressive, humanitarian mind and your ability to channel brilliant, futuristic ideas. Your weakness is an intellectual stubbornness and a cold emotional detachment.",
        moon: "You process your feelings intellectually, needing emotional space and independence to feel safe. While you are a champion for collective causes, your shadow is a tendency to remain detached from your personal, intimate feelings.",
        mercury: "Your mind is highly progressive, original, and brilliant at thinking outside the box. You communicate with unique, forward-thinking logic, but you can be incredibly stubborn about your intellectual beliefs.",
        venus: "You need absolute friendship, unique individuality, and mental space in your relationships. You are attracted to unconventional partners, but you easily shut down if a relationship becomes codependent or emotionally suffocating.",
        mars: "Your sexual energy is unique, experimental, and driven by deep intellectual chemistry. You crave a partner who is your best friend and respects your independence, pursuing your goals with original, rebellious focus.",
        outer: "Your soul lessons challenge you to connect your brilliant mind to your warm emotional heart. Growth comes from championing collective progress while remaining personally open to intimacy."
    },
    "Pisces": {
        sun: "You are ethereal, empathetic, and highly mystical. Your strength is your profound artistic imagination and your deep, compassionate connection to the universe. Your weakness is a lack of boundaries, escapist habits, and a tendency to play the victim.",
        moon: "Your inner world is deeply emotional, psychic, and ethereal. You feel everything profoundly and possess absolute spiritual empathy, but your shadow makes you struggle to distinguish your own feelings from others' emotional noise.",
        mercury: "You think and communicate in fluid, poetic, and highly imaginative terms rather than strict logic. You are a deeply intuitive thinker, but you can easily get lost in daydreaming and struggle with structure.",
        venus: "You are a true romantic who craves an absolute, spiritual soul connection in love. You are deeply compassionate, artistic, and willing to sacrifice for your partner, but you can easily play the martyr or ignore dangerous red flags.",
        mars: "Your drive and sexual energy are emotional, mystical, and deeply spiritual. You crave absolute energetic connection and flow in the bedroom, though your motivation can easily drift if you don't feel a deep soul connection.",
        outer: "Your soul lessons challenge you to build strong psychic boundaries to protect your energy. Growth comes from grounding your beautiful dreams into daily physical reality."
    }
};

// --- REAL GOOGLE AUTH & DATA POLICY ---
async function loginWithGoogle() {
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.GoogleAuth) {
        alert("Google Auth not available in this environment.");
        return;
    }
    try {
        console.log("Attempting Google Login...");
        await window.Capacitor.Plugins.GoogleAuth.initialize();
        const user = await window.Capacitor.Plugins.GoogleAuth.signIn();
        currentUser = user;
        localStorage.setItem('user_profile', JSON.stringify(user));
        localStorage.removeItem('pending_deletion_date');
        unlockAchievement('google_linked');
        updateUI();
    } catch (error) {
        console.error('Google Auth Error:', error);
        let errorMsg = "Unknown error";
        if (typeof error === 'string') errorMsg = error;
        else if (error && error.message) errorMsg = error.message;
        else if (error && error.error) errorMsg = error.error;
        else errorMsg = JSON.stringify(error);

        if (errorMsg.includes("cancel") || errorMsg.includes("closed") || errorMsg === "{}" || errorMsg === "") {
            console.log("Suppressed or empty error:", errorMsg);
            if (errorMsg === "{}" || errorMsg === "") {
                 alert("Google Sign-In Error: Configuration missing. Please ensure 'google-services.json' is added to the 'android/app/' folder and that the SHA-1 matches your Google Console.");
            }
            return;
        }
        alert("Google Sign-In Error: " + errorMsg);
    }
}

async function logout() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.GoogleAuth) {
        await window.Capacitor.Plugins.GoogleAuth.signOut();
    }
    currentUser = null;
    localStorage.removeItem('user_profile');
    updateUI();
}

function requestDataDeletion() {
    const confirmMsg = currentLang === 'en' 
        ? "Your data will be deleted in 30 days. Log in before then to cancel. Proceed?" 
        : "Tus datos se borrarán en 30 días. Inicia sesión antes para cancelar. ¿Proceder?";
    
    if (confirm(confirmMsg)) {
        const thirtyDaysFromNow = Date.now() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('pending_deletion_date', thirtyDaysFromNow);
        logout();
    }
}

function checkDataRetention() {
    const deletionDate = localStorage.getItem('pending_deletion_date');
    if (deletionDate && Date.now() > parseInt(deletionDate)) {
        localStorage.clear();
    }
}

function updateAuthUI() {
    const storedUser = JSON.parse(localStorage.getItem('user_profile'));
    const loginContainer = document.getElementById('google-login-container');
    const logoutSection = document.getElementById('logout-section');
    const welcomeHeader = document.getElementById('welcome-header');
    const avatarDisplay = document.getElementById('user-avatar-display');
    const profileAvatar = document.getElementById('user-avatar-display-profile');
    const profileName = document.getElementById('profile-name-display');

    if (storedUser) {
        if (loginContainer) loginContainer.style.display = 'none';
        if (logoutSection) logoutSection.style.display = 'block';
        if (welcomeHeader) {
            welcomeHeader.innerText = (currentLang === 'en' ? "Welcome, " : "Bienvenido, ") + storedUser.displayName;
        }
        if (profileName) {
            profileName.innerText = storedUser.displayName;
        }
        
        // Robust Profile Pic with Error Handler
        const imgHtml = `<img src="${storedUser.imageUrl}" onerror="handleBrokenProfileImage(this)" style="width: 100%; height: 100%; border-radius: 50%; border: 1px solid var(--gold); object-fit: cover;">`;
        if (avatarDisplay) avatarDisplay.innerHTML = imgHtml;
        if (profileAvatar) profileAvatar.innerHTML = imgHtml;
    } else {
        if (loginContainer) loginContainer.style.display = 'block';
        if (logoutSection) logoutSection.style.display = 'none';
        if (welcomeHeader) {
            welcomeHeader.innerText = currentLang === 'en' ? "Welcome, Seeker" : "Bienvenido, Buscador";
        }
        if (profileName) {
            profileName.innerText = currentLang === 'en' ? "Seeker" : "Buscador";
        }
        if (avatarDisplay) avatarDisplay.innerHTML = "👤";
        if (profileAvatar) profileAvatar.innerHTML = "👤";
    }
}

function handleBrokenProfileImage(imgEl) {
    // GoogleAuth.refresh() only ever returns tokens, never imageUrl (see
    // loginWithGoogle/checkGoogleStatus), so calling it here could never
    // actually recover the picture — every failed load was permanently
    // stuck on the placeholder. Instead, retry the real stored URL once
    // (a transient network hiccup is the most common real cause), and only
    // fall back to the placeholder if that retry also fails.
    const placeholder = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
    const stored = JSON.parse(localStorage.getItem('user_profile') || 'null');
    const originalUrl = stored && stored.imageUrl;

    if (originalUrl && !imgEl.dataset.retried) {
        imgEl.dataset.retried = '1';
        imgEl.onerror = function () { imgEl.src = placeholder; };
        imgEl.src = originalUrl + (originalUrl.includes('?') ? '&' : '?') + '_retry=' + Date.now();
    } else {
        imgEl.src = placeholder;
    }
}

async function checkGoogleStatus() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.GoogleAuth) {
        try {
            console.log("Initializing Google Auth...");
            await window.Capacitor.Plugins.GoogleAuth.initialize();
            
            const storedUser = JSON.parse(localStorage.getItem('user_profile'));
            if (storedUser) {
                currentUser = storedUser;
                try {
                    // refresh() only returns fresh tokens, not the profile (imageUrl/name/etc) —
                    // merge just the tokens so the saved picture/name aren't wiped out
                    const auth = await window.Capacitor.Plugins.GoogleAuth.refresh();
                    if (auth) {
                        currentUser.authentication = auth;
                        localStorage.setItem('user_profile', JSON.stringify(currentUser));
                    }
                } catch (refreshErr) {
                    console.log("Token refresh failed, using cached profile", refreshErr);
                }
                updateUI();
            }
        } catch (e) {
            console.log("Google Auth Initialization/Refresh info:", e);
        }
    }
}

// --- UTILS ---
function getSunSign(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "aries";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "taurus";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "gemini";
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "cancer";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "leo";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "virgo";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "libra";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "scorpio";
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "sagittarius";
    if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "capricorn";
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "aquarius";
    return "pisces";
}

window.toggleLanguage = function() {
    currentLang = currentLang === 'en' ? 'es' : 'en';
    localStorage.setItem('alkami_lang', currentLang);
    updateUI();
};

window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    document.querySelectorAll('.bottom-nav button').forEach(btn => btn.classList.remove('nav-active'));
    const activeBtn = Array.from(document.querySelectorAll('.bottom-nav button'))
        .find(btn => btn.getAttribute('onclick').includes(pageId));
    if (activeBtn) activeBtn.classList.add('nav-active');

    // Dynamic Header Subtitle
    const subtitle = document.getElementById('header-subtitle');
    if (subtitle) {
        if (pageId === 'natal') {
            subtitle.innerText = currentLang === 'en' ? "ASTRAL PROFILE" : "PERFIL ASTRAL";
            subtitle.style.display = 'block';
        } else if (pageId === 'news') {
            subtitle.innerText = currentLang === 'en' ? "HOROSCOPE" : "HORÓSCOPO";
            subtitle.style.display = 'block';
        } else if (pageId === 'tarot') {
            subtitle.innerText = currentLang === 'en' ? "THE ORACLE" : "EL ORÁCULO";
            subtitle.style.display = 'block';
        } else if (pageId === 'books') {
            subtitle.innerText = currentLang === 'en' ? "MUST READS" : "LECTURAS";
            subtitle.style.display = 'block';
        } else if (pageId === 'psychics') {
            subtitle.innerText = currentLang === 'en' ? "ELITE GUIDES" : "GUÍAS ÉLITE";
            subtitle.style.display = 'block';
        } else {
            subtitle.style.display = 'none';
        }
    }

    window.scrollTo(0, 0);
};

function updateUI() {
    document.getElementById('lang-toggle-text').innerText = currentLang.toUpperCase();
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) el.innerText = translations[currentLang][key];
    });

    renderPsychics();
    renderNews();
    renderAchievements();
    updateAuthUI();
    loadBirthDetails(); // Load and auto-calculate chart if details exist
}

// --- AUTO-SAVE & RECALL BIRTH DETAILS ---
window.autoSaveBirthDetails = function() {
    const details = {
        date: document.getElementById('birth-date').value,
        time: document.getElementById('birth-time').value,
        city: document.getElementById('city-search').value,
        lat: document.getElementById('birth-lat').value,
        lon: document.getElementById('birth-lon').value,
        tz: document.getElementById('birth-tz').value
    };
    localStorage.setItem('alkami_birth_details', JSON.stringify(details));
};

function loadBirthDetails() {
    const saved = localStorage.getItem('alkami_birth_details');
    const details = saved ? JSON.parse(saved) : null;
    
    if (details) {
        if (document.getElementById('birth-date')) document.getElementById('birth-date').value = details.date;
        if (document.getElementById('birth-time')) document.getElementById('birth-time').value = details.time;
        if (document.getElementById('city-search')) document.getElementById('city-search').value = details.city;
        if (document.getElementById('birth-lat')) document.getElementById('birth-lat').value = details.lat;
        if (document.getElementById('birth-lon')) document.getElementById('birth-lon').value = details.lon;
        if (document.getElementById('birth-tz')) document.getElementById('birth-tz').value = details.tz;
        
        // Auto calculate chart on launch
        setTimeout(() => {
            calculateChart(true); // pass true to skip smooth scrolling on app launch
        }, 100);
    }

    const joinEl = document.getElementById('join-date');
    if (joinEl && joinEl.innerText === '---') {
        joinEl.innerText = new Date().toLocaleDateString(currentLang === 'en' ? 'en-US' : 'es-ES');
    }

    const dateDisplay = document.getElementById('dashboard-date');
    if (dateDisplay) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.innerText = new Date().toLocaleDateString(currentLang === 'en' ? 'en-US' : 'es-ES', options);
    }
}

function renderPsychics() {
    const list = document.getElementById('psychic-list');
    if (!list) return;
    list.innerHTML = psychics.map(p => `
        <div class="psychic-card glass">
            <div class="psychic-header" style="display: flex; align-items: center; gap: 15px; text-align: left; margin-bottom: 1rem;">
                <img src="${p.image}" alt="${p.name}" style="width: 70px; height: 70px; border-radius: 50%; border: 2px solid var(--gold);">
                <div>
                    <h3 style="margin: 0;">${p.name}</h3>
                    <p style="margin: 0; color: var(--gold); font-size: 0.8rem;">${p.specialty[currentLang]}</p>
                </div>
            </div>
            <p style="font-size: 0.85rem; line-height: 1.4; margin-bottom: 1.5rem; text-align: left; min-height: 3.5rem;">${p.bio[currentLang]}</p>
            <div style="display: flex; gap: 10px;">
                <a href="${p.video}" target="_blank" class="gold-btn glow" style="width: 100%; text-decoration: none; display: flex; align-items: center; justify-content: center;">${translations[currentLang].chatNow}</a>
            </div>
        </div>
    `).join('');
}

function renderNews() {
    const list = document.getElementById('news-list');
    const selectedSign = document.getElementById('sign-selector')?.value || 'all';
    if (!list) return;

    const currentTransit = transits2026[currentTransitIndex];
    if (!currentTransit) return;

    const advice = generateAdvice(selectedSign, currentTransit.key);
    if (selectedSign !== 'all' && selectedSign !== 'ALL') unlockAchievement('first_horoscope');

    // advice fields can be a single string (old templated fallback) or an
    // array of short paragraphs (curated content) — render either as
    // properly spaced <p> tags instead of one dense block.
    const paragraphs = (val) => (Array.isArray(val) ? val : [val]).map(p => `<p>${p}</p>`).join('');

    let displayContent = selectedSign === 'all' ? paragraphs(advice.general) : `
        <div class="advice-section">
            <h4 style="color: var(--gold); margin-bottom: 5px;">${translations[currentLang].adviceGeneral}</h4>
            ${paragraphs(advice.general)}
        </div>
        <div class="advice-section">
            <h4 style="color: var(--gold); margin-bottom: 5px; margin-top: 15px;">${translations[currentLang].adviceLove}</h4>
            ${paragraphs(advice.love)}
        </div>
        <div class="advice-section">
            <h4 style="color: var(--gold); margin-bottom: 5px; margin-top: 15px;">${translations[currentLang].adviceCareer}</h4>
            ${paragraphs(advice.work)}
        </div>
    `;

    list.innerHTML = `
        <div class="news-navigation glass">
            <button class="nav-arrow" onclick="changeTransit(-1)">←</button>
            <span class="current-date">${currentTransit.date}</span>
            <button class="nav-arrow" onclick="changeTransit(1)">→</button>
        </div>
        <div class="news-card glass transit">
            <h3 style="color: var(--gold); margin-top: 0; text-transform: capitalize;">${currentTransit.key.replace(/([A-Z])/g, ' $1')}</h3>
            ${displayContent}
            ${selectedSign !== 'all' ? `<div class="sign-footer" style="margin-top: 20px; font-size: 0.7rem; color: #888; border-top: 1px solid var(--glass-border); padding-top: 10px;">${currentLang === 'en' ? 'Personalized for' : 'Personalizado para'} ${translations[currentLang].signs[selectedSign]}</div>` : ''}
        </div>
    `;
}

window.changeTransit = function(delta) {
    currentTransitIndex = (currentTransitIndex + delta + transits2026.length) % transits2026.length;
    renderNews();
};

window.drawTarot = function() {
    const deck = document.getElementById('tarot-deck');
    const result = document.getElementById('tarot-result');
    const name = document.getElementById('tarot-card-name');
    const meaning = document.getElementById('tarot-card-meaning');
    const image = document.getElementById('tarot-card-image');

    if (!deck || !result || !name || !meaning || !image) return;

    deck.style.transform = "rotateY(180deg) scale(0.8)";
    deck.style.opacity = "0";

    setTimeout(() => {
        deck.style.display = "none";
        result.classList.remove('hidden');
        const card = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
        const isReversed = Math.random() > 0.3;
        name.innerText = card.name[currentLang] + (isReversed ? ` (${translations[currentLang].reversed})` : "");
        let m = card.meaning[currentLang];
        const key = currentLang === 'en' ? "UPSIDE DOWN" : "BOCA ABAJO";
        if (m.includes(key)) {
            const parts = m.split(key);
            m = isReversed ? (parts[1] || "").trim().replace(/^is /, "").replace(/^an /, "") : parts[0].trim();
        }
        meaning.innerText = m.charAt(0).toUpperCase() + m.slice(1);
        image.innerHTML = `<img src="${card.image}" alt="${card.name.en}" style="transform: ${isReversed ? 'rotate(180deg)' : 'rotate(0deg)'}">`;
        unlockAchievement('first_tarot');
    }, 600);
};

window.resetTarot = function() {
    const deck = document.getElementById('tarot-deck');
    const result = document.getElementById('tarot-result');
    if (deck && result) {
        result.classList.add('hidden');
        deck.style.display = "flex";
        deck.style.transform = "rotateY(0deg) scale(1)";
        deck.style.opacity = "1";
    }
};

function getAchievements() { return JSON.parse(localStorage.getItem('alkami_achievements') || '[]'); }

function unlockAchievement(id) {
    let unlocked = getAchievements();
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('alkami_achievements', JSON.stringify(unlocked));
        showAchievementPopup(id);
        renderAchievements();
    }
}

function showAchievementPopup(id) {
    const ach = achievementsList.find(a => a.id === id);
    const popup = document.createElement('div');
    popup.className = 'achievement-popup glass glow';
    popup.innerHTML = `<div class="ach-icon">${ach.icon}</div><div class="ach-text"><h4>${ach[currentLang]}</h4><p>${ach.desc[currentLang]}</p></div>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add('show'), 100);
    setTimeout(() => { popup.classList.remove('show'); setTimeout(() => popup.remove(), 500); }, 4000);
}

function renderAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    const unlocked = getAchievements();
    container.innerHTML = `<h3 data-i18n="achievementsTitle">${translations[currentLang].achievementsTitle}</h3><div class="achievements-grid">${achievementsList.map(ach => `<div class="achievement-item glass ${unlocked.includes(ach.id) ? 'unlocked' : 'locked'}"><div class="ach-icon">${ach.icon}</div><div class="ach-info"><h4>${ach[currentLang]}</h4><p>${ach.desc[currentLang]}</p></div>${unlocked.includes(ach.id) ? '<div class="ach-check">✅</div>' : ''}</div>`).join('')}</div>`;
}

function createBackground() {
    const container = document.querySelector('.stars-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        const size = Math.random() * 2 + 0.5;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${Math.random() * 4 + 1}s`);
        container.appendChild(star);
    }
}

// --- GEOCODING & DYNAMIC CALCULATIONS ---
let debounceTimer;
window.searchCities = function() {
    const query = document.getElementById('city-search').value.trim();
    const resultsDiv = document.getElementById('city-results');
    
    if (query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                resultsDiv.innerHTML = data.results.map(city => `
                    <div class="city-item" onclick="selectCity('${city.name.replace(/'/g, "\\'")}', '${(city.admin1 || '').replace(/'/g, "\\'")}', '${city.country.replace(/'/g, "\\'")}', ${city.latitude}, ${city.longitude}, '${city.timezone || "America/New_York"}')">
                         <b>${city.name}</b>, ${city.admin1 ? city.admin1 + ', ' : ''}${city.country} 
                         <span style="font-size: 0.7rem; color: #888; float: right;">(${city.latitude.toFixed(2)}°, ${city.longitude.toFixed(2)}°)</span>
                    </div>
                `).join('');
                resultsDiv.style.display = 'block';
            } else {
                resultsDiv.innerHTML = '<div style="padding: 10px; color: #888;">No cities found</div>';
                resultsDiv.style.display = 'block';
            }
        } catch (e) {
            console.error("Geocoding failed", e);
        }
    }, 300);
}

window.selectCity = function(name, region, country, lat, lon, timezone) {
    document.getElementById('city-search').value = `${name}, ${region ? region + ', ' : ''}${country}`;
    document.getElementById('birth-lat').value = lat;
    document.getElementById('birth-lon').value = lon;
    document.getElementById('birth-tz').value = timezone || "UTC";
    
    document.getElementById('custom-lat').value = lat;
    document.getElementById('custom-lon').value = lon;
    
    document.getElementById('city-results').style.display = 'none';
    autoSaveBirthDetails();
}

window.toggleManualCoords = function() {
    const customDiv = document.getElementById('custom-coords');
    if (customDiv.style.display === 'none') {
        customDiv.style.display = 'grid';
    } else {
        customDiv.style.display = 'none';
    }
}

window.syncManualCoords = function() {
    const lat = parseFloat(document.getElementById('custom-lat').value) || 0;
    const lon = parseFloat(document.getElementById('custom-lon').value) || 0;
    document.getElementById('birth-lat').value = lat;
    document.getElementById('birth-lon').value = lon;
    document.getElementById('birth-tz').value = "UTC";
    document.getElementById('city-search').value = `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    autoSaveBirthDetails();
}

function getSignInfo(degree) {
    const index = Math.floor(degree / 30) % 12;
    const deg = Math.floor(degree % 30);
    const min = Math.floor((degree % 1) * 60);
    return {
        name: zodiacSigns[index],
        degStr: `${deg}°${min}'`
    };
}

function localTimeToUTC(dateVal, timeVal, timeZone) {
    const [year, month, day] = dateVal.split('-').map(Number);
    const [hour, minute] = timeVal.split(':').map(Number);
    const utcBase = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const offsetMinutes = getUTCOffset(timeZone, utcBase);
    const utcTime = utcBase.getTime() - (offsetMinutes * 60000);
    return new Date(utcTime);
}

function getUTCOffset(timeZone, date) {
    const tz = timeZone || "UTC";
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    const diff = tzDate.getTime() - utcDate.getTime();
    return diff / 60000;
}

window.generateParagraphs = function(planetKey, signKey) {
    const capitalizedSignKey = signKey.charAt(0).toUpperCase() + signKey.slice(1).toLowerCase();
    const signData = interpretationsDb[capitalizedSignKey];
    if (!signData) return ["No description available for this placement.", ""];

    let text = "";
    let pName = planetKey;
    
    if (pName === "Sun") text = signData.sun;
    else if (pName === "Moon") text = signData.moon;
    else if (pName === "Mercury") text = signData.mercury;
    else if (pName === "Venus") text = signData.venus;
    else if (pName === "Mars") text = signData.mars;
    else text = signData.outer;

    const pInfo = planetData[pName] || { name: pName, glyph: "🪐" };

    const para1 = `With your <b>${pInfo.glyph} ${pInfo.name} in ${capitalizedSignKey}</b>, ${text}`;
    
    let para2 = "";
    if (pName === "Venus" || pName === "Mars") {
        para2 = `<b>Romantic & Sexual Vibe:</b> Romantically and sexually, you seek absolute alignment. Your attraction is driven by raw desire, needing a partner who respects your boundaries while matching your passion. If a relationship becomes stagnant, or if your desires are unmet, you will feel restless.`;
    } else if (pName === "Sun" || pName === "Moon" || pName === "Ascendant") {
        para2 = `<b>Core Growth Path:</b> Your ultimate growth comes from balancing these intense tendencies. Embrace your unique strengths, but remain hyper-aware of your shadow traits so they do not hold you back from manifesting your absolute potential.`;
    } else {
        para2 = `<b>Life Application:</b> In your daily life, this energy dictates how you tackle obstacles. Use this placement's talent to navigate challenges with grace, keeping a steady eye on the long-term spiritual legacy you are building.`;
    }

    return [para1, para2];
}

window.toggleInterpretation = function(id) {
    const el = document.getElementById(id);
    const wasActive = el.classList.contains('active');
    document.querySelectorAll('.interpretation-item').forEach(item => item.classList.remove('active'));
    if (!wasActive) {
        el.classList.add('active');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

window.focusInterpretation = function(planetName) {
    const id = `interp-${planetName}`;
    toggleInterpretation(id);
}

window.calculateChart = function(skipScroll = false) {
    const dateVal = document.getElementById('birth-date').value;
    const timeVal = document.getElementById('birth-time').value;
    if (!dateVal || !timeVal) {
        if (!skipScroll) alert("Please fill in both birth date and birth time.");
        return;
    }

    const lat = parseFloat(document.getElementById('birth-lat').value);
    const lon = parseFloat(document.getElementById('birth-lon').value);
    const tz = document.getElementById('birth-tz').value;

    const birthDate = localTimeToUTC(dateVal, timeVal, tz);
    const observer = new Astronomy.Observer(lat, lon, 0);

    // 1. Calculate Sun
    const sunEquator = Astronomy.Equator("Sun", birthDate, observer, true, true);
    const sunEcliptic = Astronomy.Ecliptic(sunEquator.vec);
    const sunSign = getSignInfo(sunEcliptic.elon);

    // 2. Calculate Moon
    const moonEquator = Astronomy.Equator("Moon", birthDate, observer, true, true);
    const moonEcliptic = Astronomy.Ecliptic(moonEquator.vec);
    const moonSign = getSignInfo(moonEcliptic.elon);

    // 3. Calculate Ascendant, Midheaven, and house cusps
    // (corrected formulas + Placidus house cusps live in natalEngine.js)
    const obliquity = obliquityForDate(birthDate);
    const ramc = calculateRAMC(birthDate, lon);
    const ascendant = calculateAscendant(ramc, lat, obliquity);
    const midheaven = calculateMidheaven(ramc, obliquity);
    const houseCusps = calculatePlacidusHouses(ramc, lat, obliquity, ascendant, midheaven);
    const ascSign = getSignInfo(ascendant);
    const mcSign = getSignInfo(midheaven);

    // 4. Calculate Other Planets
    const planetaryBodies = [
        { id: "Mercury", label: "Mercury" },
        { id: "Venus", label: "Venus" },
        { id: "Mars", label: "Mars" },
        { id: "Jupiter", label: "Jupiter" },
        { id: "Saturn", label: "Saturn" },
        { id: "Uranus", label: "Uranus" },
        { id: "Neptune", label: "Neptune" },
        { id: "Pluto", label: "Pluto" }
    ];

    // Render Big Three
    document.getElementById('sun-name').innerText = sunSign.name;
    document.getElementById('sun-deg').innerText = sunSign.degStr;
    document.getElementById('moon-name').innerText = moonSign.name;
    document.getElementById('moon-deg').innerText = moonSign.degStr;
    document.getElementById('asc-name').innerText = ascSign.name;
    document.getElementById('asc-deg').innerText = ascSign.degStr;

    const placements = [
        { planet: 'Sun', label: '🌞 Sun', sign: sunSign.name, deg: sunSign.degStr, lonDeg: sunEcliptic.elon, glyph: '\u2609' },
        { planet: 'Moon', label: '🌙 Moon', sign: moonSign.name, deg: moonSign.degStr, lonDeg: moonEcliptic.elon, glyph: '\u263D' },
        { planet: 'Ascendant', label: '🌅 Ascendant', sign: ascSign.name, deg: ascSign.degStr, lonDeg: ascendant, glyph: 'AC' }
    ];

    const PLANET_GLYPHS = {
        Mercury: '\u263F', Venus: '\u2640', Mars: '\u2642', Jupiter: '\u2643',
        Saturn: '\u2644', Uranus: '\u2645', Neptune: '\u2646', Pluto: '\u2647'
    };

    planetaryBodies.forEach(p => {
        try {
            const equator = Astronomy.Equator(p.id, birthDate, observer, true, true);
            const ecliptic = Astronomy.Ecliptic(equator.vec);
            const signInfo = getSignInfo(ecliptic.elon);

            let icon = "🪐";
            if (p.id === "Mercury") icon = "☿️";
            if (p.id === "Venus") icon = "♀️";
            if (p.id === "Mars") icon = "♂️";

            placements.push({
                planet: p.id,
                label: `${icon} ${p.label}`,
                sign: signInfo.name,
                deg: signInfo.degStr,
                lonDeg: ecliptic.elon,
                glyph: PLANET_GLYPHS[p.id] || '\u25CB'
            });
        } catch (e) {
            console.error("Could not calculate " + p.id, e);
        }
    });

    // Assign house numbers to every placement (Sun, Moon, Ascendant, planets)
    placements.forEach(p => {
        p.house = houseOfLongitude(p.lonDeg, houseCusps);
    });

    // Compute aspects between all placements
    const aspectList = findAspects(placements);

    // Write Placements Table (now includes House column)
    const tableBody = document.getElementById('planet-details-body');
    if (tableBody) {
        tableBody.innerHTML = placements.map(p => `
            <tr class="planet-row" onclick="focusInterpretation('${p.planet}')">
                <td>${p.label}</td>
                <td><b>${p.sign}</b></td>
                <td>${p.deg}</td>
                <td>${p.planet === 'Ascendant' ? '1' : p.house}</td>
            </tr>
        `).join('');
    }

    // Write House Cusps Table
    const houseBody = document.getElementById('house-cusps-body');
    if (houseBody) {
        houseBody.innerHTML = houseCusps.map((cuspLon, i) => {
            const signInfo = getSignInfo(cuspLon);
            const label = (i === 0) ? '1st (Asc)' : (i === 9) ? '10th (MC)' : `${i + 1}${ordinalSuffix(i + 1)}`;
            return `
                <tr>
                    <td>${label}</td>
                    <td><b>${signInfo.name}</b></td>
                    <td>${signInfo.degStr}</td>
                </tr>
            `;
        }).join('');
    }

    // Write Aspects Table
    const aspectsBody = document.getElementById('aspects-body');
    if (aspectsBody) {
        const sorted = aspectList.slice().sort((a, b) => a.exactness - b.exactness);
        aspectsBody.innerHTML = sorted.map(asp => `
            <tr>
                <td>${asp.a.glyph} ${asp.b.glyph}</td>
                <td style="color:${asp.type.color};">${asp.type.name}</td>
                <td>${asp.exactness.toFixed(1)}°</td>
            </tr>
        `).join('') || '<tr><td colspan="3" style="color:#888;">No major aspects within orb.</td></tr>';
    }

    // Render Interpretations Accordion
    const interpContainer = document.getElementById('interpretations-container');
    if (interpContainer) {
        interpContainer.innerHTML = placements.map(p => {
            const [para1, para2] = generateParagraphs(p.planet, p.sign);
            return `
                <div class="interpretation-item" id="interp-${p.planet}">
                    <div class="interpretation-header" onclick="toggleInterpretation('interp-${p.planet}')">
                        <span>${p.label} in ${p.sign}</span>
                        <span style="font-size: 0.8rem; color: var(--gold);">▼</span>
                    </div>
                    <div class="interpretation-content">
                        <p>${para1}</p>
                        <p>${para2}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Unlock Achievement
    unlockAchievement('profile_master');

    // Show results block
    document.getElementById('natal-results-section').style.display = 'block';
    
    // Smoothly scroll to results
    if (!skipScroll) {
        document.getElementById('natal-results-section').scrollIntoView({ behavior: 'smooth' });
    }
}

function ordinalSuffix(n) {
    if (n % 10 === 1 && n % 100 !== 11) return 'st';
    if (n % 10 === 2 && n % 100 !== 12) return 'nd';
    if (n % 10 === 3 && n % 100 !== 13) return 'rd';
    return 'th';
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    checkDataRetention();
    createBackground();
    
    const today = new Date();
    currentTransitIndex = transits2026.findIndex(n => new Date(`${n.date} 2026`) >= today);
    if (currentTransitIndex === -1) currentTransitIndex = transits2026.length - 1;

    updateUI();
    checkGoogleStatus();
    setSkin(localStorage.getItem('alkami_skin') || 'aurora');
    showPage('news');

    const selector = document.getElementById('sign-selector');
    if (selector) selector.value = getSunSign(today);
});
