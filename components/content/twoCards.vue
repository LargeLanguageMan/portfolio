<template>
  <div class="two-cards flex justify-between gap-4">
    <!-- First card -->

  <div class="project-card-two">
    <img :src="imageSrc1" alt="Project Cover Image" class="project-image" />
    <h3>{{ title1 }}</h3>
    <p>{{ description1 }}</p>
    <ButtonLink :href="href1">Learn More</ButtonLink>
  </div>
    <!-- Second card -->

  <div class="project-card-two">
    <img :src="imageSrc2" alt="Project Cover Image" class="project-image" />
    <h3>{{ title2 }}</h3>
    <p>{{ description2 }}</p>
    <ButtonLink :href="href2">Learn More</ButtonLink>
  </div>
  </div>
</template>


<script setup>
defineProps({
  title1: {
    type: String,
    required: true
  },
  description1: {
    type: String,
    required: true
  },
  href1: {
    type: String,
    required: true
  },
  imageSrc1: {
    type: String,
    default: '/new.png' // Default cover image
  },

  title2: {
    type: String,
    required: true
  },
  description2: {
    type: String,
    required: true
  },
  href2: {
    type: String,
    required: true
  },
  imageSrc2: {
    type: String,
    default: '/new.png' // Default cover image
  }
});
</script>
<style scoped>
.project-card-two {
  border: 1px solid #ccc;
  width: 50%;
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
  margin: 10px;
  padding:15px;
  font-size: 1rem;
 height:200px; 
}
 ButtonLink {
  margin-top: auto;
  padding: auto;
  margin: 24px;
  /* Pushes the button to the bottom of the card */
} 
</style>
