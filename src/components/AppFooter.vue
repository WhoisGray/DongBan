<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="app-footer">
    <div>
      <span class="brand-mini">د</span>
      <p>
        <strong>دنگ‌بان، متن‌باز و ساخته‌شده برای همه</strong>
        <small>دُنگ‌ها را ساده ببند.</small>
      </p>
    </div>
    <nav>
      <RouterLink to="/guide" class="transition-colors hover:text-primary">راهنمای استفاده</RouterLink>
      <RouterLink to="/about" class="transition-colors hover:text-primary">دربارهٔ پروژه</RouterLink>
      <a href="https://github.com/WhoisGray/DongBan" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-primary">
        ⭐ ستاره در GitHub
      </a>
      <a href="https://dongban.ir" class="font-mono text-primary hover:underline">dongban.ir</a>
    </nav>
  </footer>
</template>
