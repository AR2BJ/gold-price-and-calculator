<p align="center">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES2026-F7DF1E?style=flat-square&logo=javascript" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat-square&logo=tailwindcss" />
  <img alt="ApexCharts" src="https://img.shields.io/badge/ApexCharts-Data%20Charts-E31A1C?style=flat-square" />
  <img alt="PWA" src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat-square" />
  <img alt="Responsive" src="https://img.shields.io/badge/Responsive-Desktop%20%26%20Mobile-34A853?style=flat-square" />
</p>

<br/>

# ماشین‌حساب و قیمت طلا

یک اپلیکیشن وب فارسی و سبک برای محاسبه و مقایسهٔ قیمت‌های طلا، تبدیل واحدهای مختلف و بررسی روند بازار با رابط کاربری مدرن و واکنش‌گرا.

## Overview

این پروژه برای کاربران علاقه‌مند به سرمایه‌گذاری، خرید طلا و محاسبهٔ ارزش سکه و اجناس طلایی طراحی شده است. از طریق داشبورد، کاربران می‌توانند قیمت لحظه‌ای طلا، نرخ دلار، ارزش گرم طلای ۱۸ عیار و سایر واحدهای مرتبط را مشاهده کنند و با استفاده از ابزار تبدیل واحد، محاسبه‌های دقیق‌تر انجام دهند.

## Key Features

- مشاهدهٔ قیمت لحظه‌ای بازار طلا و نرخ ارز
- نمایش اطلاعات طلای ۱۸ عیار، مظنه، اونس و دلار
- نمودار روند قیمت و محاسبهٔ اختلاف نسبت به قیمت عادلانه
- تبدیل واحدهای مختلف طلا مانند گرم، اونس تروآ، اونس معمولی، مثقال، سوت و قیراط
- محاسبهٔ ارزش بر اساس عیار و خلوص طلا
- نمایش رابط روشن و تاریک با تجربهٔ کاربری بهتر
- پشتیبانی از نمایش ارقام فارسی و قالب‌بندی مناسب برای کاربران ایرانی
- مدیریت کش محلی در مرورگر برای کاهش درخواست‌های تکراری

## Project Goals

این پروژه با هدف ارائهٔ یک ابزار کاربردی و سریع برای:

- بررسی قیمت لحظه‌ای طلا
- انجام محاسبات دقیق تبدیل واحدها
- تحلیل و مقایسهٔ قیمت‌های بازار با ارزش نظری طلا
- ارائهٔ تجربه‌ای ساده و راحت برای کاربران ایرانی
- نشان دادن معماری frontend مدرن و سبک در پروژه‌های JavaScript

## Technology Stack

- Vite
- Vanilla JavaScript
- Tailwind CSS
- ApexCharts
- vite-plugin-pwa
- LocalStorage / sessionStorage
- Responsive UI

## Project Structure

```text
gold-calculator/
├── index.html
├── src/
│   ├── assets/
│   │   ├── css/
│   │   └── font/
│   ├── components/
│   │   └── autocomplete.component.js
│   ├── core/
│   │   ├── calculators.js
│   │   └── constants.js
│   ├── services/
│   │   └── api.js
│   ├── ui/
│   │   ├── converter.js
│   │   ├── dashboard.js
│   │   └── format.js
│   ├── main.js
│   └── ...
├── vendor/
│   └── tabler/
├── package.json
├── vite.config.js
├── LICENSE
├── .gitignore
└── README.md
```

## Architecture

ساختار پروژه به‌صورت ماژولار و تمیز طراحی شده است تا منطق محاسباتی، داده‌های بازار و لایهٔ رابط کاربری به‌صورت مجزا نگهداری شوند:

- `src/core/` — ثابت‌های محاسباتی، واحدهای طلا و فرمول‌های تبدیل
- `src/services/` — دریافت داده‌های قیمت از API و مدیریت کش
- `src/ui/` — ساخت داشبورد، نمودارها و نمایش داده‌ها
- `src/components/` — کامپوننت‌های قابل استفاده مجدد مانند autocomplete
- `src/assets/` — فایل‌های CSS، فونت و استایل‌ها
- `src/main.js` — نقطهٔ ورود و تنظیمات کلی صفحه و تب‌ها

این ساختار باعث خوانایی بهتر، توسعهٔ ساده‌تر و نگهداری راحت‌تر کد می‌شود.

## Installation

ابتدا پروژه را کلون کنید:

```bash
git clone <repository-url>
cd gold-calculator
```

سپس وابستگی‌ها را نصب کنید:

```bash
npm install
```

## Running the Application

برای اجرای حالت توسعه:

```bash
npm run dev
```

برای ساخت نسخهٔ تولیدی:

```bash
npm run build
```

برای پیش‌نمایش نسخهٔ ساخته‌شده:

```bash
npm run preview
```

## Usage

1. اپلیکیشن را در مرورگر باز کنید.
2. از داشبورد، قیمت‌های لحظه‌ای و روند بازار را ببینید.
3. برای تبدیل واحدها، به بخش «تبدیر واحد» بروید.
4. مقدار مورد نظر، واحد مبدأ و عیار/خلوص را تنظیم کنید.
5. نتیجه‌های تبدیل در قالب‌های مختلف به‌صورت خودکار نمایش داده می‌شود.
6. با تغییر تم، ظاهر برنامه را به روشن یا تاریک تغییر دهید.

## Roadmap

امکانات آینده ممکن است شامل این موارد باشند:

- افزودن نمودارهای بیشتر برای تحلیل تاریخی بازار
- نمایش جداول قیمت روزانه و هفتگی
- پشتیبانی بهتر از سکه و شمش‌های مختلف
- اضافه کردن مقایسهٔ چند نرخ طلای مختلف
- بهبود تجربهٔ کاربری روی موبایل
- سازگاری بیشتر با داده‌های رسمی بازارهای داخلی

## License

این پروژه تحت مجوز [MIT](./LICENSE) منتشر شده است.

## Contributing

مشارکت‌ها خوش‌آمدگاند. اگر می‌خواهید رابط کاربری را بهبود دهید، محاسبات را دقیق‌تر کنید یا ساختار پروژه را توسعه دهید، می‌توانید یک pull request ارسال کنید یا مشکل را به‌صورت issue گزارش دهید.
