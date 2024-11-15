<script setup lang="ts">
	import { computed } from "vue";

	const props = defineProps<{
		x: number;
		y: number;
		color: string;
	}>();

	const posX = computed(() => `${props.x}px`);
	const posY = computed(() => `${props.y}px`);
</script>

<template>
	<!--
		Reproduction Steps:
			0) Observe the distance in which the dot follows the cursor.
			1) Scroll the window (but not to the very end)
			2) Move the cursor to update the position
			3) Scroll the window to the end *without* moving the mouse cursor
			4) Observe the distance between dot & the cursor is the same as the scroll offset present @ step 2


		Side notes & recommendations:
			- I'd recommend using an external mouse with a physical scroll wheel since track pads can cause unintended mouse movements that can affect reproduction.
			- I added a copy of the "useMouse" composable with a hotfix applied to demonstrate the "correct" values.
				> This will also make successful reproductions of the bug more clear as the 2 dots will no longer be overlapping.
	-->
	<div class="mouse-pos" :style="{ top: posY, left: posX }">
		<span class="dot" :style="{ backgroundColor: color }" />
		<label class="coords">(x: {{ x }}, y: {{ y }})</label>
	</div>
</template>

<style scoped>
	.mouse-pos {
		display: flex;
		flex-flow: row nowrap;
		align-items: flex-start;
		justify-content: flex-start;
		position: absolute;
	}

	.dot {
		display: block;
		width: 5px;
		height: 5px;
		border-radius: 50%;
	}
</style>