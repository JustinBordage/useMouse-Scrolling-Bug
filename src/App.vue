<script setup lang="ts">
	import MousePosition from "@/components/MousePosition.vue";
	import { useMouse } from "@vueuse/core";
	import { useMouseHotFixed } from "@/composables/useMouseHotFixed";
	import { useMouseFixed } from "@/composables/useMouse_issue4244_fix";

	const { x, y } = useMouse();
	const { x: hotfixedX, y: hotfixedY } = useMouseHotFixed();
	const { x: fixedX, y: fixedY } = useMouseFixed();
</script>

<template>
	<div class="app-wrapper">
		<MousePosition :x="hotfixedX" :y="hotfixedY" color="blue" />
		<MousePosition :x="x" :y="y" color="red" />
		<MousePosition :x="fixedX" :y="fixedY" color="green" />
	</div>
</template>

<style scoped>
	.app-wrapper {
		width: 100vw;
		/** Using larger height than viewport to demonstrate the scroll bug */
		height: 120vh;
	}
</style>
