-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-11-2026 a las 06:26:35
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tzabek`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin`
--

CREATE TABLE `admin` (
  `IDAdmin` int(11) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Correo` varchar(150) NOT NULL,
  `Contrasena` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `admin`
--

INSERT INTO `admin` (`IDAdmin`, `Nombre`, `Correo`, `Contrasena`) VALUES
(1, 'Esmeralda Rivera', 'esme_riv@gmail.com', '$2y$10$SPwQloHH7H6KGHj1tkkYG.5aQ71bwIxaPQtg1I2apfexlCUh6bNJK');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion`
--

CREATE TABLE `cotizacion` (
  `IDCotizacion` int(11) NOT NULL,
  `IDDron` int(11) DEFAULT NULL,
  `Asunto` varchar(100) DEFAULT NULL,
  `Nombre` varchar(150) NOT NULL,
  `Correo` varchar(150) NOT NULL,
  `Telefono` varchar(25) DEFAULT NULL,
  `Empresa` varchar(150) DEFAULT NULL,
  `Ayuda` text DEFAULT NULL,
  `FechaSolicitud` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cotizacion`
--

INSERT INTO `cotizacion` (`IDCotizacion`, `IDDron`, `Asunto`, `Nombre`, `Correo`, `Telefono`, `Empresa`, `Ayuda`, `FechaSolicitud`) VALUES
(1, NULL, 'Cotización', 'asd', 'sadad@aoskd.com', '659987744', 'La cabaña', 'Quiero un dron nocturno', '2026-11-11 05:32:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dron`
--

CREATE TABLE `dron` (
  `IDDron` int(11) NOT NULL,
  `Nombre` varchar(150) NOT NULL,
  `Categoria` varchar(150) NOT NULL,
  `Descripcion` text DEFAULT NULL,
  `Proposito` text DEFAULT NULL,
  `Ventajas` text DEFAULT NULL,
  `AutonomiaVuelo` varchar(100) DEFAULT NULL,
  `Alcance` varchar(100) DEFAULT NULL,
  `Peso` varchar(100) DEFAULT NULL,
  `CamaraSensores` text DEFAULT NULL,
  `Imagenes` text DEFAULT NULL,
  `Aplicaciones` text DEFAULT NULL,
  `PublicoObjetivo` text DEFAULT NULL,
  `HistoriaModelo` text DEFAULT NULL,
  `VelocidadMaxima` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `dron`
--

INSERT INTO `dron` (`IDDron`, `Nombre`, `Categoria`, `Descripcion`, `Proposito`, `Ventajas`, `AutonomiaVuelo`, `Alcance`, `Peso`, `CamaraSensores`, `Imagenes`, `Aplicaciones`, `PublicoObjetivo`, `HistoriaModelo`, `VelocidadMaxima`) VALUES
(1, 'Pardalis', 'Seguridad y vigilancia', 'El centinela de la penumbra. Dron táctico de alta fidelidad para operaciones de seguridad en condiciones de oscuridad profunda.', 'Vigilancia nocturna, patrullaje táctico y análisis de datos para tomar decisiones con precisión.', 'Inteligencia adaptativa con IA para reconocimiento en tiempo real; estabilidad inteligente con modos asistidos; resistencia de frontera (viento, polvo y calor); hardware y software personalizables.', 'Hasta 35 minutos', 'Hasta 7 km de cobertura táctica; altitud operativa de hasta 70 m', NULL, 'Imagen 4K para uso diurno; visión nocturna en baja luz / Starlight', 'pardalis.png', 'Vigilancia nocturna; patrullaje y protección de perímetros; análisis de datos para la toma de decisiones.', 'Operaciones de seguridad y vigilancia.', NULL, NULL),
(2, 'Mitis', 'Seguridad y vigilancia', 'El rastreador del pulso vital. Dron táctico para seguridad y monitoreo de alta fidelidad con detección térmica de objetivos.', 'Seguridad y monitoreo en entornos complejos con precisión absoluta, con detección térmica.', 'Inteligencia adaptativa con IA; estabilidad inteligente con modos asistidos; resistencia de frontera (viento, polvo y calor); ingeniería personalizable.', 'Hasta 35 minutos', 'Hasta 7 km de cobertura táctica; altitud operativa de hasta 70 m', NULL, 'Imagen 4K para uso diurno; detección térmica de objetivos', 'mitis.png', 'Detección térmica; reconocimiento en tiempo real mediante inteligencia artificial; control y medición en operaciones tácticas.', 'Operaciones de seguridad y vigilancia.', NULL, NULL),
(3, 'Wiedii', 'Seguridad y vigilancia', 'Ojo de la frontera. Dron táctico para seguridad y monitoreo de alta fidelidad en entornos complejos.', 'Vigilancia estratégica, reconocimiento y control en operaciones que requieren claridad y exactitud.', 'Inteligencia adaptativa con IA; estabilidad inteligente con modos asistidos; resistencia de frontera (viento, polvo y calor); personalización de hardware y software.', 'Hasta 35 minutos', 'Hasta 7 km de cobertura táctica; altitud operativa de hasta 70 m', NULL, 'Imagen 4K para uso diurno', 'wiedii.png', 'Vigilancia estratégica; reconocimiento mediante inteligencia artificial; control y medición.', 'Operaciones de seguridad y vigilancia.', NULL, 'Hasta 60 km/h'),
(4, 'Halcón Azul', 'Educativo y entrenamiento', 'Herramienta educativa que redefine la enseñanza tecnológica desde la frontera. Dron educativo de construcción modular, diseñado y desarrollado en Ciudad Juárez.', 'Convertir la innovación en un recurso tangible para el aula: cursos de ingeniería, programación, robótica y tecnología avanzada.', 'Sostenibilidad académica (reset total: el sistema se reinicia para cada curso); vuelo asistido para quienes comienzan en el pilotaje; ingeniería a la medida (hardware y software adaptables). Es el primer vuelo: curioso, amigable, divertido e inspirador.', '15 minutos de vuelo', NULL, NULL, 'Visión HD (según modelo)', 'halcon_azul_1.jpg', 'Aprendizaje integral (del ensamble manual a la programación de código); innovación en el aula; desarrollo de habilidades de navegación y estrategia.', 'Escuelas y estudiantes de ingeniería, programación y robótica.', 'Diseñado y desarrollado en Ciudad Juárez como el primer vuelo: el dron que enamora de la robótica.', 'Hasta 60 km/h'),
(5, 'Rojà', 'Educativo y entrenamiento', 'Dron educativo de construcción modular: el primer vuelo, curioso, amigable, divertido e inspirador.', 'Llevar la innovación al aula con cursos de ingeniería, programación, robótica y tecnología avanzada.', 'Sostenibilidad académica (reset total); vuelo asistido; ingeniería a la medida (hardware y software adaptables); arquitectura modular y desmontable.', '15 minutos de vuelo', NULL, NULL, 'Visión HD (según modelo)', 'roja.png', 'Aprendizaje integral, desde la programación de código; desarrollo de habilidades de navegación y estrategia.', 'Escuelas y estudiantes de ingeniería, programación y robótica.', NULL, 'Hasta 60 km/h'),
(6, 'Estela I', 'Educativo y entrenamiento', 'El origen de la destreza. Dron de entrenamiento de alto rendimiento para dominar el vuelo manual en espacios interiores.', 'Aprender a volar con control manual puro, sin automatismos, y desarrollar destreza en interiores (pasillos, oficinas, áreas cerradas).', 'Vuelo directo sin automatismos; resistencia a impactos; ingeniería a la medida (hardware y software adaptado); visión biológica: diseño basado en biomímesis para mayor eficiencia y ligereza.', '8 minutos', NULL, '43 g (chasis compacto de 80 mm, resina de alta resistencia)', NULL, 'estela_l.jpg', 'Entrenamiento intensivo; destreza en interiores; desarrollo de habilidades: conexión instintiva entre el piloto y la aeronave.', 'Pilotos que quieren dominar el vuelo manual.', NULL, NULL),
(7, 'Kinix Air', 'Inspección industrial', 'Dron de inspección estructural: cuadricóptero plegable en fibra de carbono con cámara dual RGB 4K y térmica radiométrica.', 'Inspección de estructuras, detección de anomalías térmicas y generación de reportes técnicos y modelos 3D.', 'Estructura en fibra de carbono de grado aeronáutico; plegable para transporte y despliegue rápido; motores brushless; batería LiPo inteligente 22.2V / 6200 mAh con carga rápida de 90 min; protección IP43; modos Manual, Automático, Waypoint y Orbit; seguridad operacional con geocercas, retorno automático (RTH) y alerta de batería baja.', '25 a 30 minutos (según carga y condiciones)', 'Control hasta 15 km (enlace 2.4 / 5.8 GHz, video 1080p, cifrado AES-256)', 'Operativo 1.15 kg (sin batería/cámara); máximo al despegue 2.1 kg. Dimensiones: 36 cm sin hélices, 5', 'Cámara RGB 4K UHD (sensor 1/2.3\" CMOS) y cámara térmica radiométrica 640 x 512 px (-20 a 150 °C); sensor de terreno LiDAR (0.5 a 120 m); evasión de obstáculos 360° con visión estéreo + ToF', 'kinix_air.jpeg', 'Inspección de estructuras metálicas; detección de corrosión y fisuras; inspección de soldaduras y uniones; evaluación térmica y detección de anomalías; reportes técnicos y modelos 3D.', 'Industria: estructuras metálicas, puentes, tanques y silos, torres y plantas industriales.', 'Versión 1.0 (mayo 2024). Diseño conceptual hecho con IA basado en especificaciones técnicas de Tzab-ek; el diseño final puede variar según requerimientos de ingeniería técnica.', 'Resiste vientos sostenidos de hasta 35 km/h'),
(8, 'Halix', 'Limpieza industrial', 'Dron hexacóptero de limpieza de alta presión: potencia, precisión y autonomía para carga pesada.', 'Limpieza uniforme y controlada de superficies industriales con sistema de bombeo de alta presión.', 'Bombeo de alta presión de doble etapa; boquillas de impacto controlado; sensores de proximidad (terrain following); 6 motores X9 Plus con ESC integrado; radar 360° para evasión de obstáculos; retorno automático ante baja presión de agua; chasis de carbono reforzado; diseño modular.', 'Autonomía extendida: sistema dual de baterías 14S (22,000 mAh)', NULL, 'Peso máximo al despegue (MTOW) 85 kg con tanque lleno y baterías; diagonal entre motores 2,100 mm', 'Radar 360° de evasión de obstáculos; sensores de proximidad (terrain following); navegación inteligente con RTK', 'halix.jpeg', 'Limpieza de paneles solares; limpieza industrial de fachadas; limpieza de techos industriales; limpieza de infraestructura crítica.', 'Operadores industriales y de energía solar.', 'Diseño conceptual hecho con IA basado en especificaciones técnicas de Tzab-ek; el diseño final puede variar según requerimientos de ingeniería técnica.', NULL),
(9, 'Nthoki', 'Agrícola', 'Dron agrícola multipropósito de alta capacidad para maximizar la eficiencia en el campo.', 'Aplicación uniforme y precisa de fertilizantes líquidos, pesticidas y semillas sobre grandes superficies. Más eficiencia, menos desperdicio, mayores rendimientos.', 'Diseño modular (fuselaje, 4 motores, bombas de 8 L/min y sistema de fumigación); radar de seguimiento de terreno; plegable para fácil transporte (713 x 713 x 663 mm); dos controles de vuelo (Avanzado y Estándar); GPS y RTK para navegación exacta; autonomía pensada para jornadas de trabajo exigentes.', NULL, NULL, 'Peso máximo de despegue 42 kg; tanque de 20 litros; dimensiones 1954 x 1954 x 663 mm (expandido)', 'GPS, RTK y radares anticolisión (frontal y trasero); radar de seguimiento de terreno', 'nthoki.jpg', 'Fertilizantes líquidos; pesticidas; semillas.', 'Productores agrícolas.', NULL, NULL),
(10, 'Kyash', 'Cinematografía', 'El regreso del color al adobe. Herramienta cinematográfica de alta tecnología para capturar la realidad con una narrativa visual fluida.', 'Captura cinematográfica y registro visual: convertir un suceso en una pieza visual de gran calidad, con búsqueda de luz y textura.', 'Garantía de 3 meses con opción a extensión y respaldo técnico directo; resistencia superior en condiciones extremas; herramienta creativa; ingeniería a la medida con soporte local.', '15 minutos', 'Radio de operación de hasta 500 m', '43 g (chasis compacto de 80 mm)', 'Video 4K con ángulo de visión gran angular de 155°; memoria externa para gestión directa de datos', 'kyash.jpg', 'Captura cinematográfica; registro visual para documentar la historia y el entorno.', 'Periodistas y cronistas.', NULL, 'Hasta 40 km/h; estable ante vientos de hasta 25 km/h'),
(11, 'Xoch\'', 'Carga y logística', 'Hacemos drones. Vendemos poder. Dron de diseño furtivo, todo terreno, con capacidad de carga de hasta 5 kg.', 'Operar con carga útil y transitar largas distancias en condiciones exigentes.', 'Diseño furtivo: geometría de baja detectabilidad para minimizar el rebote de radar (RCS reducido); capacidad de carga de hasta 5 kg sugeridos; resiliencia con operación todo terreno y resistencia a vientos de hasta 45 km/h.', '25 minutos de vuelo en condiciones óptimas (ida y vuelta)', 'Tránsito de 13 km en 16 minutos', '7 kg sin batería; peso máximo al despegue (MTOW) 14.2 kg; dimensiones 1.05 x 1.05 x 0.45 m sin hélic', NULL, 'xoch.jpeg', NULL, NULL, 'Diseño conceptual generado con inteligencia artificial a partir de especificaciones técnicas; el producto final puede presentar variaciones estructurales, de acabado o de componentes. Energía: Li-Ion 32000 mAh.', 'Velocidad de crucero de 50 km/h');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `IDEmpleado` int(11) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Rango` varchar(100) NOT NULL,
  `Correo` varchar(150) NOT NULL,
  `Contrasena` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleado`
--

INSERT INTO `empleado` (`IDEmpleado`, `Nombre`, `Rango`, `Correo`, `Contrasena`) VALUES
(1, 'Alejandra Galaviz', 'Dirección General', 'ale_galaviz@tzabek.com', '$2y$10$MM1bvveyDB8bkUH2fuyKX.vicNVMEogui6FX4iJVx.6lDMUr2CyWS');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagen`
--

CREATE TABLE `imagen` (
  `IDImagen` int(11) NOT NULL,
  `IDDron` int(11) NOT NULL,
  `NombreImagen` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `imagen`
--

INSERT INTO `imagen` (`IDImagen`, `IDDron`, `NombreImagen`) VALUES
(1, 1, 'pardalis.png'),
(2, 2, 'mitis.png'),
(3, 3, 'wiedii.png'),
(4, 4, 'halcon_azul_1.jpg'),
(5, 4, 'halcon_azul_2.jpg'),
(6, 5, 'roja.png'),
(7, 6, 'estela_l.jpg'),
(8, 7, 'kinix_air.jpeg'),
(9, 8, 'halix.jpeg'),
(10, 9, 'nthoki.jpg'),
(11, 10, 'kyash.jpg'),
(12, 11, 'xoch.jpeg');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`IDAdmin`),
  ADD UNIQUE KEY `Correo` (`Correo`);

--
-- Indices de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD PRIMARY KEY (`IDCotizacion`),
  ADD KEY `fk_cotizacion_dron` (`IDDron`);

--
-- Indices de la tabla `dron`
--
ALTER TABLE `dron`
  ADD PRIMARY KEY (`IDDron`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`IDEmpleado`),
  ADD UNIQUE KEY `Correo` (`Correo`);

--
-- Indices de la tabla `imagen`
--
ALTER TABLE `imagen`
  ADD PRIMARY KEY (`IDImagen`),
  ADD KEY `fk_imagen_dron` (`IDDron`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admin`
--
ALTER TABLE `admin`
  MODIFY `IDAdmin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  MODIFY `IDCotizacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `dron`
--
ALTER TABLE `dron`
  MODIFY `IDDron` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `empleado`
--
ALTER TABLE `empleado`
  MODIFY `IDEmpleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `imagen`
--
ALTER TABLE `imagen`
  MODIFY `IDImagen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD CONSTRAINT `fk_cotizacion_dron` FOREIGN KEY (`IDDron`) REFERENCES `dron` (`IDDron`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `imagen`
--
ALTER TABLE `imagen`
  ADD CONSTRAINT `fk_imagen_dron` FOREIGN KEY (`IDDron`) REFERENCES `dron` (`IDDron`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
