<script setup>
const appVersion = __APP_VERSION__
</script>

<template>
  <div class="page about-page stack-lg">
    <section class="about-hero"><span class="about-hero__mark">د</span><div><span class="eyebrow">دربارهٔ دنگ‌بان</span><h1>حساب دوستی باید ساده باشد.</h1><p>دنگ‌بان یک ابزار فارسی، آفلاین و متن‌باز برای تقسیم منصفانهٔ هزینه‌های گروهی است. اطلاعات مالی شما روی دستگاه خودتان می‌ماند.</p><div class="actions actions--start"><a class="btn btn--primary" href="https://github.com/WhoisGray/DongBan" target="_blank" rel="noopener noreferrer">⭐ دیدن و ستاره‌دادن در GitHub</a><a class="btn btn--ghost" href="https://dongban.ir">dongban.ir</a></div></div></section>
    <section class="panel"><div class="section-heading"><div><span class="eyebrow">چرا متن‌باز؟</span><h2>شفاف، قابل بررسی و قابل مشارکت</h2></div></div><div class="values-grid"><article><span>🔍</span><h3>شفافیت</h3><p>منطق محاسبه و نحوهٔ نگهداری اطلاعات برای همه قابل بررسی است.</p></article><article><span>🧩</span><h3>مشارکت</h3><p>ایده، گزارش باگ و Pull Requestهای جامعه به بهترشدن دنگ‌بان کمک می‌کند.</p></article><article><span>🔒</span><h3>حریم خصوصی</h3><p>رویدادها و هزینه‌ها در localStorage دستگاه ذخیره می‌شوند، نه در یک حساب ابری.</p></article></div></section>
    <section class="panel release-notes"><div class="section-heading"><div><span class="eyebrow">تازه‌های نسخه {{ appVersion }}</span><h2>چه چیزهایی جدید است؟</h2></div></div><ul><li>اعلان و نصب کنترل‌شدهٔ آپدیت‌های PWA</li><li>تقویم کامل هجری شمسی</li><li>کارت تصویری قابل دانلود و اشتراک‌گذاری</li><li>مهاجرت امن اطلاعات نسخه‌های قبلی</li><li>دامنهٔ رسمی dongban.ir و صفحهٔ پروژهٔ متن‌باز</li></ul></section>
  </div>
</template>
