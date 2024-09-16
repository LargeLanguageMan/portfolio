
<template>
  <div class="project-card">
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
  } 
});
</script>
<style scoped>
.project-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s;
  margin-bottom:35px;
  margin-top:35px;
  width:auto;
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
  margin: 20px;
  font-size: 1rem;

}
</style>
