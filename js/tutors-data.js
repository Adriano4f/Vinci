"use strict";
/* tutors-data.ts — shared static catalog of NEXUM tutors.
 *
 * This file acts as a makeshift database: every page that needs tutor data
 * (tutorias.html, tutorias-tutores.html, tutorias-tutor.html) loads
 * js/tutors-data.js before its own script and reads the global NEXUM_TUTORS.
 * When a real database arrives, only this file changes shape — the pages
 * keep asking for the same fields.
 *
 * TYPE NOTES:
 * - `interface NxTutor` lives at top level OUTSIDE any function, so with
 *   tsconfig `module: "none"` it becomes part of the shared global scope:
 *   tutorias.ts and tutor-profile.ts can annotate `NxTutor` directly.
 * - Same for `const NEXUM_TUTORS`: a top-level `const` in a script (not a
 *   module) is visible to every later script on the page — it is in the
 *   global lexical scope, though it does NOT become a `window.` property
 *   (only `var` and function declarations do that at top level).
 * - `slug` is the URL key: tutorias-tutor.html?t=<slug> looks the tutor up
 *   with .find(t => t.slug === param).
 */
const NEXUM_TUTORS = [
    {
        slug: "james-carter",
        name: "James Carter", spec: "Matemáticas y Álgebra", years: 5,
        level: "Secundaria y Bachillerato", rating: 4.9, students: 45,
        img: "../img/tutorias/nexum-tutor-james.jpg",
        bio: "Ingeniero con pasión por hacer las matemáticas simples. Lleva 5 años ayudando a estudiantes que 'odiaban los números' a aprobar con buenas notas.",
        bioLong: "Ingeniero civil convertido en educador. James descubrió su vocación dando clases de refuerzo en la universidad y desde entonces ha dedicado 5 años a convertir las matemáticas en algo accesible. Su método se centra en entender el 'por qué' de cada paso antes de memorizar fórmulas, y muchos de sus estudiantes pasan de odiar los números a disfrutar resolver problemas. Trabaja principalmente con estudiantes de secundaria y bachillerato.",
        subjects: ["Matemáticas", "Álgebra"], hours: "Lun–Vie · 2:00–8:00 PM",
    },
    {
        slug: "elena-sokolova",
        name: "Elena Sokolova", spec: "Cálculo y Trigonometría", years: 4,
        level: "Bachillerato y Universidad", rating: 4.8, students: 38,
        img: "../img/tutorias/nexum-tutor-elena.jpg",
        bio: "Licenciada en Matemáticas. Especialista en derivadas, integrales y en explicar el 'por qué' detrás de cada fórmula.",
        bioLong: "Licenciada en Matemáticas con formación pedagógica. Elena se especializa en cálculo diferencial e integral: derivadas, integrales y sus aplicaciones reales. Su enfoque desarma cada demostración en pasos pequeños para que el estudiante vea la lógica detrás de la fórmula, no solo el procedimiento. Trabaja con bachilleres que se preparan para la universidad y con universitarios en sus primeros cursos de análisis.",
        subjects: ["Cálculo", "Trigonometría"], hours: "Lun–Sáb · 8:00 AM–4:00 PM",
    },
    {
        slug: "kenji-tanaka",
        name: "Kenji Tanaka", spec: "Física", years: 6,
        level: "Bachillerato y Universidad", rating: 4.9, students: 52,
        img: "../img/tutorias/nexum-tutor-kenji.jpg",
        bio: "Físico con 6 años de experiencia docente. Convierte problemas de cinemática y electricidad en algo que por fin tiene sentido.",
        bioLong: "Físico de formación y docente por vocación. Kenji lleva 6 años enseñando física a nivel de bachillerato y universidad: cinemática, dinámica, energía y electricidad. Su sello es traducir cada problema a una situación física concreta antes de tocar una sola ecuación, para que los números cuenten una historia que el estudiante pueda seguir.",
        subjects: ["Física", "Matemáticas"], hours: "Lun–Vie · 4:00–8:00 PM",
    },
    {
        slug: "lena-fischer",
        name: "Lena Fischer", spec: "Matemáticas universitarias", years: 3,
        level: "Universidad", rating: 4.7, students: 29,
        img: "../img/tutorias/nexum-tutor-lena.jpg",
        bio: "Estudiante avanzada de matemáticas puras y tutora certificada. Enfocada en cálculo, álgebra lineal y preparación de exámenes.",
        bioLong: "Estudiante avanzada de matemáticas puras y tutora certificada por su universidad. Lena se enfoca en el nivel universitario: cálculo en varias variables, álgebra lineal, geometría analítica y preparación intensiva de exámenes parciales y finales. Como aún cursa la carrera, conoce de primera mano los temas donde los estudiantes suelen trabarse y los explica en el mismo idioma del estudiante.",
        subjects: ["Cálculo", "Álgebra", "Geometría"], hours: "Mié–Dom · 10:00 AM–6:00 PM",
    },
    {
        slug: "oliver-bennett",
        name: "Oliver Bennett", spec: "Geometría y Matemáticas", years: 4,
        level: "Secundaria y Bachillerato", rating: 4.8, students: 34,
        img: "../img/tutorias/nexum-tutor-oliver.jpg",
        bio: "Profesor de matemáticas especializado en geometría. Enseña a visualizar los problemas antes de resolverlos con números.",
        bioLong: "Profesor de matemáticas con 4 años de experiencia en secundaria y bachillerato. Oliver es especialista en geometría: ángulos, triángulos, circunferencias, áreas y volúmenes. Su método siempre empieza con el dibujo — enseña a sus estudiantes a visualizar el problema en el plano antes de plantear una sola ecuación, lo que convierte ejercicios que parecían imposibles en cuestión de observar bien la figura.",
        subjects: ["Geometría", "Matemáticas"], hours: "Lun–Sáb · 9:00 AM–5:00 PM",
    },
    {
        slug: "priya-sharma",
        name: "Priya Sharma", spec: "Cálculo y Álgebra", years: 5,
        level: "Bachillerato y Universidad", rating: 4.9, students: 41,
        img: "../img/tutorias/nexum-tutor-priya.jpg",
        bio: "Matemática con experiencia en cálculo y álgebra superior. Famosa entre sus estudiantes por sus explicaciones paso a paso.",
        bioLong: "Matemática con 5 años de experiencia docente en bachillerato y universidad. Priya domina el cálculo y el álgebra superior: límites, series, sistemas de ecuaciones y matrices. Sus clases son famosas por el ritmo paso a paso — ningún tema avanza hasta que el estudiante puede explicarlo de vuelta con sus propias palabras. Ideal para quienes se sienten perdidos en cursos rápidos de la universidad.",
        subjects: ["Cálculo", "Álgebra"], hours: "Mar–Dom · 2:00–7:00 PM",
    },
    {
        slug: "mei-chen",
        name: "Mei Chen", spec: "Álgebra y Trigonometría", years: 3,
        level: "Secundaria y Bachillerato", rating: 4.8, students: 27,
        img: "../img/tutorias/nexum-tutor-mei.jpg",
        bio: "Especialista en álgebra y trigonometría. Convierte identidades y sistemas de ecuaciones en retos que se disfrutan.",
        bioLong: "Tutora especializada en álgebra y trigonometría para secundaria y bachillerato. Mei transforma las identidades trigonométricas y los sistemas de ecuaciones — temas que suelen intimidar — en retos progresivos que el estudiante termina disfrutando. Su experiencia de 3 años se concentra en construir bases sólidas para que el cálculo posterior no sea una sorpresa.",
        subjects: ["Álgebra", "Trigonometría"], hours: "Lun–Vie · 3:00–8:00 PM",
    },
    {
        slug: "omar-haddad",
        name: "Omar Haddad", spec: "Física y Geometría", years: 7,
        level: "Bachillerato y Universidad", rating: 4.9, students: 60,
        img: "../img/tutorias/nexum-tutor-omar.jpg",
        bio: "Físico con 7 años enseñando mecánica, electricidad y geometría analítica. El más solicitado para exámenes de admisión.",
        bioLong: "Físico con 7 años de experiencia, el tutor con más estudiantes atendidos del equipo. Omar enseña mecánica, electricidad, ondas y geometría analítica, y es el más solicitado para la preparación de exámenes de admisión universitaria. Combina la intuición física con el rigor matemático: primero se entiende el fenómeno, luego se modela y finalmente se resuelve.",
        subjects: ["Física", "Geometría"], hours: "Lun–Sáb · 8:00 AM–6:00 PM",
    },
];
//# sourceMappingURL=tutors-data.js.map