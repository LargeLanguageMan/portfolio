<script setup>
defineProps({
  href: {
    type: String,
    required: true,
  },
  external: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <span class="not-prose">
    <NuxtLink :to="href" :external="external" class ="box">
      <Icon v-if="icon" :name="icon" class="w-4 h-4" />
      <ContentSlot :use="$slots.default" unwrap="p" />
    </NuxtLink>
  </span>
</template>


<style scoped>
.box {
  border: 1.5px;
  text:white solid;
  flex:inline;
  font-weight:bold;
  

  background-color: #4158D0;
  background-image: linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);
  
  transition: transform 0.3s;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  max-width: 300px;
  transition: transform 0.3s;
}
.box:hover {
  transform: scale(1.05);
}
</style>
