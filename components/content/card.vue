
<template>
  <div class="project-card">
    <img :src="imageSrc" alt="Project Cover Image" class="project-image" />
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <ButtonLink :href="href">Learn More</ButtonLink>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  href: {
    type: String,
    required: true
  },
  imageSrc: {
    type: String,
    default: 'cover.jpg' // Default cover image
  }
});
</script>
<style scoped>
.project-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  max-width: 300px;
  transition: transform 0.3s;
  margin-bottom:35px;
}
.project-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
h3 {
  margin-top: 10px;
  font-size: 1.5rem;
}
p {
  margin: 10px 0;
  font-size: 1rem;
}
</style>
