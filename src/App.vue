<script setup lang="ts">
	import MousePosition from "@/components/MousePosition.vue";
	import { useMouse } from "@vueuse/core";
	import { useMouseHotFixed } from "@/composables/useMouseHotFixed";

	const { x, y } = useMouse();
	const { x: hotfixedX, y: hotfixedY } = useMouseHotFixed();
</script>

<template>
	<div class="app-wrapper">
		<MousePosition :x="hotfixedX" :y="hotfixedY" color="blue" />
		<MousePosition :x="x" :y="y" color="red" />
	</div>
</template>

<style scoped>
	.app-wrapper {
		width: 100vw;
		/** Using larger height than viewport to demonstrate the scroll bug */
		height: 120vh;
	}
</style>
