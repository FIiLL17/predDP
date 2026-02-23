-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Фев 23 2026 г., 17:56
-- Версия сервера: 10.7.5-MariaDB
-- Версия PHP: 8.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `vinylneon_db`
--

-- --------------------------------------------------------

--
-- Структура таблицы `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `product_image` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `added_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `product_title`, `product_price`, `product_image`, `quantity`, `added_at`) VALUES
(2, 1, 3, 'Levitating', '27.99', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 2, '2026-01-26 18:58:04'),
(3, 1, 2, 'Blinding Lights', '24.99', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 2, '2026-01-26 19:12:59'),
(4, 6, 1, 'Midnight City', '29.99', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-01-26 19:21:28'),
(5, 6, 4, 'Stay', '25.99', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-01-26 19:27:58'),
(6, 6, 3, 'Levitating', '27.99', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 3, '2026-01-26 19:50:39'),
(8, 3, 5, 'Good 4 U', '26.99', 'https://images.unsplash.com/photo-1519281682544-5f37c4b14c47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-01-26 19:52:13'),
(9, 3, 3, 'Levitating', '27.99', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-01-26 20:09:37'),
(10, 3, 2, 'Blinding Lights', '24.99', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-01-26 20:17:29'),
(11, 1, 5, 'Good 4 U', '26.99', 'https://images.unsplash.com/photo-1519281682544-5f37c4b14c47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-01-29 17:04:15'),
(12, 1, 1, 'Midnight City', '29.99', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-01-29 18:15:57'),
(14, 8, 3, 'Levitating', '27.99', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-02-02 16:48:43'),
(15, 9, 5, 'Good 4 U', '26.99', 'https://images.unsplash.com/photo-1519281682544-5f37c4b14c47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-02-07 10:49:46'),
(19, 7, 4, 'Stay', '25.99', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-02-17 16:35:41'),
(20, 10, 4, 'Stay', '25.99', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 1, '2026-02-23 14:28:28');

-- --------------------------------------------------------

--
-- Структура таблицы `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `product_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `added_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `product_id`, `product_title`, `product_price`, `product_image`, `added_at`) VALUES
(2, 1, 2, 'Blinding Lights', '24.99', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2023-10-20 07:15:00'),
(3, 1, 3, 'Levitating', '27.99', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2023-10-25 13:45:00'),
(4, 1, 4, 'Stay', '25.99', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2023-11-01 09:20:00'),
(11, 3, 4, 'Stay', '25.99', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2026-01-26 20:06:30'),
(13, 1, 1, 'Midnight City', '29.99', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2026-02-01 15:13:34'),
(14, 7, 4, 'Stay', '25.99', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2026-02-01 15:36:32'),
(15, 7, 5, 'Good 4 U', '26.99', 'https://images.unsplash.com/photo-1519281682544-5f37c4b14c47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2026-02-02 13:36:44'),
(16, 7, 1, 'Midnight City', '29.99', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2026-02-02 16:46:57'),
(17, 8, 3, 'Levitating', '27.99', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2026-02-02 16:48:41'),
(18, 9, 5, 'Good 4 U', '26.99', 'https://images.unsplash.com/photo-1519281682544-5f37c4b14c47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2026-02-07 10:49:43'),
(19, 10, 3, 'Levitating', '27.99', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2026-02-17 14:49:48');

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `total_amount`, `status`, `payment_method`, `shipping_address`, `shipping_city`, `shipping_phone`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'NEON-2023-001', 1, '129.95', 'completed', 'credit_card', 'ул. Советская, д. 25, кв. 17, Калининград', 'Калининград', '+7 (999) 123-45-67', 'Позвонить за час до доставки', '2023-10-12 11:30:00', '2026-01-26 12:17:33'),
(2, 'NEON-2023-002', 1, '75.50', 'processing', 'online_payment', 'ул. Горького, д. 10, офис 305, Калининград', 'Калининград', '+7 (999) 987-65-43', 'Доставить до 18:00', '2023-10-28 08:15:00', '2026-01-26 12:17:33'),
(3, 'NEON-2023-003', 1, '54.99', 'pending', 'paypal', 'ул. Лесная, д. 5, кв. 42, Москва', 'Москва', '+7 (495) 123-45-67', NULL, '2023-11-05 06:45:00', '2026-01-26 12:17:33'),
(4, 'NEON-2023-004', 1, '89.99', 'shipped', 'credit_card', 'ул. Советская, д. 25, кв. 17, Калининград', 'Калининград', '+7 (999) 123-45-67', NULL, '2023-11-10 13:20:00', '2026-01-26 12:17:33'),
(5, 'NEON-2023-005', 1, '32.50', 'cancelled', 'credit_card', 'ул. Горького, д. 10, офис 305, Калининград', 'Калининград', '+7 (999) 987-65-43', 'Отмена по инициативе клиента', '2023-11-12 07:30:00', '2026-01-26 12:17:33'),
(7, 'NEON-4825', 1, '24990.00', 'completed', NULL, 'ул. Неоновая, д. 15, кв. 42', 'Калининград', '+7 (912) 345-67-89', NULL, '2026-01-26 18:02:24', '2026-01-26 18:02:24'),
(8, 'NEON-4791', 1, '15750.00', 'processing', NULL, 'пр. Светящийся, д. 7, офис 12', 'Санкт-Петербург', '+7 (912) 345-67-89', NULL, '2026-01-26 18:02:24', '2026-01-26 18:02:24'),
(9, 'NEON-7971', 7, '53.98', 'pending', 'card', 'Калининград, Портовая улица, д.2', NULL, NULL, '', '2026-02-17 16:07:54', '2026-02-17 16:07:54'),
(10, 'NEON-9656', 10, '110.96', 'pending', 'qr', 'посёлок Прибрежное, Полевая улица, д.4', NULL, NULL, '', '2026-02-17 16:31:57', '2026-02-17 16:31:57');

-- --------------------------------------------------------

--
-- Структура таблицы `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_title`, `product_price`, `quantity`, `subtotal`) VALUES
(1, 1, 1, 'Midnight City', '29.99', 2, '59.98'),
(2, 1, 2, 'Blinding Lights', '24.99', 1, '24.99'),
(3, 1, 3, 'Levitating', '27.99', 1, '27.99'),
(4, 1, 4, 'Stay', '25.99', 1, '25.99'),
(5, 2, 5, 'Good 4 U', '26.99', 2, '53.98'),
(6, 2, 2, 'Blinding Lights', '24.99', 1, '24.99'),
(7, 3, 3, 'Levitating', '27.99', 1, '27.99'),
(8, 3, 1, 'Midnight City', '29.99', 1, '29.99'),
(9, 4, 4, 'Stay', '25.99', 3, '77.97'),
(10, 4, 5, 'Good 4 U', '26.99', 1, '26.99'),
(11, 5, 1, 'Midnight City', '29.99', 1, '29.99'),
(12, 1, 1, 'Midnight City', '29.99', 1, '29.99'),
(17, 9, 3, 'Levitating', '27.99', 1, '27.99'),
(18, 9, 4, 'Stay', '25.99', 1, '25.99'),
(19, 10, 3, 'Levitating', '27.99', 3, '83.97'),
(20, 10, 5, 'Good 4 U', '26.99', 1, '26.99');

-- --------------------------------------------------------

--
-- Структура таблицы `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `artist` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `is_active`, `token`, `created_at`, `updated_at`) VALUES
(1, 'fill', 'fill@gmail.com', '$2y$10$I4T/Q4zku3JO/GAkSubcTeWjQRF230gbez61/JlrHaK6xPVDN6fkS', 'admin', 1, 'ffabdd4cef8ad68fd1a03935d32b646d6aba39964250ccbf72f1af18c3077c64', '2026-01-25 19:34:37', '2026-02-23 14:15:31'),
(2, 'ggg', 'dam@d.com', '$2y$10$q/HUEWzIcxfe8dbX5Fot6OEV9CRjDialw5UqEuJ5gOuYslLaumbDu', 'user', 1, 'b7b4318ef0aeb9301f9d33f9694e38db986b57cd90af456f435a951b761c9930', '2026-01-25 19:36:19', '2026-01-25 20:08:16'),
(3, 'www', 'www@w.ru', '$2y$10$vmRtlJXpV/GFo5X2H9sKsu1XYX1PAmHhl.BBlRzgFnHq8Adaa4jz.', 'user', 1, 'd552888a2478f5916d9a60183d79e037868a6586bd33846bc3d6299dee2b2ba7', '2026-01-25 19:46:07', '2026-02-07 16:58:38'),
(4, 'ttt', 'ttt@t.tt', '$2y$10$.dfx9wCd3J14DJ9pZiJiJeMU8.3orCGGLPXl6a7xaPJcc9AtvAnne', 'user', 1, '2662d76891b0f603196d2bcca7fbeef88907661de2cb917a85a45672228606ee', '2026-01-25 19:55:19', '2026-01-25 19:55:28'),
(5, 'sws', 'sws@s.ws', '$2y$10$h1NnTeT7Z5jNPAKgF/YjjuEMiLu/i5GsLIYaumJ0NerEZZ7nYYEzC', 'user', 1, NULL, '2026-01-25 21:44:17', '2026-01-25 21:51:24'),
(6, 'sss', 'sss@s.w', '$2y$10$oUfYB/ogASDtL/X0b3Pkme9uo/GaY2PIerOnRQ5kXhKzfloVYFpEW', 'user', 1, 'a4c35d677068cf503ba63924f491c04c60bdc4b7b24bea2d1d8d1467a79b9348', '2026-01-26 19:20:00', '2026-01-26 19:50:27'),
(7, 'drg', 'drg@drg.ru', '$2y$10$mkWycRrQj7sed9UmBT6kduxhN7rfPy2AKDigS079ZoVZsrgN7V5iW', 'user', 1, 'f5f0f27a50be9669307c9de848475a90d68bdedb479c19ded897f4b20bb64ab0', '2026-02-01 14:21:55', '2026-02-17 16:36:16'),
(8, '121', 'damik3735@gmail.com', '$2y$10$KT4RvVaDpjPaT6ZbiAiX0uX8hkkkNRjYvuEXak5VXNszIhZNjbplm', 'user', 1, 'a7bb26236e25abf91817d2a92bcbce04f841ae0ba37d70efb68d2953ae5b4c34', '2026-02-02 16:48:26', '2026-02-02 16:48:28'),
(9, 'soso', 'soso@so.com', '$2y$10$ETZ9qFu30nV8qii7tQ3FM.KU7g6PfTfysAz.l65sUzh9nxqf9hT0O', 'user', 1, '24f213d7381793fb4b48cd0cf1ea5e00e5581df7f25a874c2b3b673653adac04', '2026-02-07 10:49:20', '2026-02-07 10:55:02'),
(10, 'sas', 'sas@SW.com', '$2y$10$qz5lz4rnVF53UxMGiaZW5.7k0fQ3PQcrvtP8LUvTZ6TeUwbd2PIPK', 'user', 1, '2cb8fdc2d3845a02efa68d2ee30ce0cb26ff9ef2209847109c978d003dd86b29', '2026-02-17 14:49:31', '2026-02-23 14:27:52');

-- --------------------------------------------------------

--
-- Структура таблицы `user_delivery_addresses`
--

CREATE TABLE `user_delivery_addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Дом',
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `street` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `house` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `building` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entrance` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `floor` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apartment` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_office` tinyint(1) DEFAULT 0,
  `is_default` tinyint(1) DEFAULT 0,
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `user_delivery_addresses`
--

INSERT INTO `user_delivery_addresses` (`id`, `user_id`, `title`, `full_name`, `phone`, `city`, `street`, `house`, `building`, `entrance`, `floor`, `apartment`, `is_office`, `is_default`, `notes`, `created_at`) VALUES
(1, 1, 'Дом', 'Филипп Иванов', '+7 (999) 123-45-67', 'Калининград', 'ул. Советская', '25', NULL, '2', '3', '17', 0, 0, 'Подъезд 2, этаж 3, кв. 17', '2026-02-01 15:24:23'),
(2, 1, 'Работа', 'Филипп Иванов', '+7 (999) 987-65-43', 'Калининград', 'ул. Горького', '10', 'БЦ \"Неоновый\"', NULL, NULL, '305', 1, 0, 'Офис 305, 3 этаж', '2026-02-01 15:24:23'),
(3, 1, 'Родители', 'Ивановы', '+7 (495) 123-45-67', 'Москва', 'ул. Лесная', '5', NULL, '42', NULL, '42', 0, 1, '0', '2026-02-01 15:24:23'),
(4, 7, 'Дом', 'Иванченков Анатолий Сергеевич', '+79041009010', 'Калининград', 'Портовая улица', '2', '', '1', '2', '5', 0, 1, '0', '2026-02-02 14:07:02'),
(9, 7, 'Дом', '12 12', '+79041090910', 'Калининград', 'переулок Грига', '1', '', '', '', '', 0, 0, '0', '2026-02-02 16:38:16'),
(10, 9, 'Дом', 'ырчвр ыврывы ывыв', '+79041009010', 'Калининград', 'улица Подполковника Иванникова', '6', '', '', '', '', 0, 0, '0', '2026-02-07 10:52:48'),
(11, 10, 'Дом', 'ситдорова кошакова', '+79324356521', 'посёлок Прибрежное', 'Полевая улица', '4', '', '', '', '', 0, 1, '0', '2026-02-17 14:51:17');

-- --------------------------------------------------------

--
-- Структура таблицы `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_address` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bonus_points` int(11) DEFAULT 0,
  `discount_percent` int(11) DEFAULT 0,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `full_name`, `first_name`, `last_name`, `phone`, `birth_date`, `avatar_url`, `city`, `address`, `delivery_address`, `delivery_notes`, `bonus_points`, `discount_percent`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Филипп Иванов', 'Филипп', 'Иванов', '+7 (999) 123-45-67', '1990-05-15', NULL, 'Калининград', 'ул. Советская, д. 25, кв. 17', NULL, NULL, 1540, 5, 'active', '2026-01-26 12:07:42', '2026-02-01 15:23:46'),
(2, 2, 'ggg ', 'ggg', '', '+7 (999) 123-45-67', NULL, NULL, 'Москва', NULL, NULL, NULL, 1000, 5, 'active', '2026-01-26 12:07:42', '2026-02-01 15:23:46'),
(3, 5, 'sws ', 'sws', '', '+7 (999) 123-45-67', NULL, NULL, 'Москва', NULL, NULL, NULL, 1000, 5, 'active', '2026-01-26 12:07:42', '2026-02-01 15:23:46'),
(4, 4, 'ttt ', 'ttt', '', '+7 (999) 123-45-67', NULL, NULL, 'Москва', NULL, NULL, NULL, 1000, 5, 'active', '2026-01-26 12:07:42', '2026-02-01 15:23:46'),
(5, 3, 'www ', 'www', '', '+7 (999) 123-45-67', NULL, NULL, 'Москва', NULL, NULL, NULL, 1000, 5, 'active', '2026-01-26 12:07:42', '2026-02-01 15:23:46'),
(8, 7, NULL, NULL, NULL, '+79009001010', NULL, NULL, NULL, NULL, NULL, NULL, 1000, 5, 'active', '2026-02-01 16:34:41', '2026-02-17 15:05:40'),
(9, 10, 'Криворпо Сомов Алепек', NULL, NULL, '+79324356521', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 'active', '2026-02-23 14:36:27', '2026-02-23 14:36:27');

-- --------------------------------------------------------

--
-- Структура таблицы `user_settings`
--

CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `sms_notifications` tinyint(1) DEFAULT 1,
  `two_factor_auth` tinyint(1) DEFAULT 0,
  `newsletter_subscription` tinyint(1) DEFAULT 1,
  `language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'ru',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'RUB'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `user_settings`
--

INSERT INTO `user_settings` (`id`, `user_id`, `email_notifications`, `sms_notifications`, `two_factor_auth`, `newsletter_subscription`, `language`, `currency`) VALUES
(1, 1, 1, 1, 0, 1, 'ru', 'RUB'),
(2, 2, 1, 1, 0, 1, 'ru', 'RUB'),
(3, 5, 1, 1, 0, 1, 'ru', 'RUB'),
(4, 4, 1, 1, 0, 1, 'ru', 'RUB'),
(5, 3, 1, 1, 0, 1, 'ru', 'RUB'),
(8, 6, 1, 0, 0, 1, 'ru', 'RUB');

-- --------------------------------------------------------

--
-- Структура таблицы `viewed_products`
--

CREATE TABLE `viewed_products` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `viewed_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `viewed_products`
--

INSERT INTO `viewed_products` (`id`, `user_id`, `product_id`, `product_title`, `product_image`, `viewed_at`) VALUES
(1, 1, 1, 'Midnight City', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2023-11-15 11:30:00'),
(2, 1, 2, 'Blinding Lights', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2023-11-15 12:45:00'),
(3, 1, 3, 'Levitating', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2023-11-16 07:20:00'),
(4, 1, 4, 'Stay', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2023-11-16 08:30:00'),
(5, 1, 5, 'Good 4 U', 'https://images.unsplash.com/photo-1519281682544-5f37c4b14c47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2023-11-17 06:15:00'),
(6, 1, 1, 'Midnight City', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', '2026-01-26 12:21:45');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`user_id`,`product_id`);

--
-- Индексы таблицы `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`user_id`,`product_id`);

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Индексы таблицы `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Индексы таблицы `user_delivery_addresses`
--
ALTER TABLE `user_delivery_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Индексы таблицы `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Индексы таблицы `viewed_products`
--
ALTER TABLE `viewed_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_viewed` (`user_id`,`viewed_at`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT для таблицы `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT для таблицы `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT для таблицы `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT для таблицы `user_delivery_addresses`
--
ALTER TABLE `user_delivery_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT для таблицы `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблицы `viewed_products`
--
ALTER TABLE `viewed_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_delivery_addresses`
--
ALTER TABLE `user_delivery_addresses`
  ADD CONSTRAINT `user_delivery_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `viewed_products`
--
ALTER TABLE `viewed_products`
  ADD CONSTRAINT `viewed_products_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
