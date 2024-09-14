<template>
  <div class="two-cards flex justify-between gap-4">
    <!-- First card -->

  <div class="project-card-two">
    <!-- <img :src="imageSrc1" alt="Project Cover Image" class="project-image" /> -->
    <h3>{{ title1 }}</h3>
     <p>{{ description1 }}</p>
    <ButtonLink :href="href1">Link to Project</ButtonLink>
  </div>
    <!-- Second card -->

  <div class="project-card-two">
    <!-- <img :src="imageSrc2" alt="Project Cover Image" class="project-image" /> -->
    <h3>{{ title2 }}</h3>
    <p>{{ description2 }}</p>
    <ButtonLink :href="href2">Link to Project</ButtonLink>
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
  }
});
</script>
<style scoped>
.project-card-two {
  border: 1px solid #ccc;
  width: 50%;
  border-radius: 8px;
  padding: 5px;
  text-align: center;
  max-width: 300px;
  transition: transform 0.3s;
  height:330px;

}
.project-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
h3 {
  font-size: 1.2rem;
  width: auto;
  margin:10px;
}
p {
  font-size: 1rem;
  height:100px;
  width:auto;
  line-height: 20px;
  text-align:center;
  margin:15px;
  height:200px;
}
 
</style>
