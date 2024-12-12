/** This code was copied from the "useMouse" file from the vueuse GitHub Repo with the changes from issue#4244 applied.
 *  This includes the typo fix from screenY to scrollY
 *
 * Issue Link: https://github.com/vueuse/vueuse/pull/4244
 * File Link: https://github.com/pkc918/vueuse/blob/60d18962e4f24361b04ecf0a1956600268408c58/packages/core/useMouse/index.ts
 * Parent commit hash: "44772a4"
 * Commit hash: "60d1896"
 * Commit description: "fix(useMouse): modify field scrollY"
 * Commit Date: Nov. 20th, 2024 @ 1:57 AM EST */

import { defaultWindow, useEventListener } from "@vueuse/core";
import type { ConfigurableWindow, Position } from "@vueuse/core";
import type { ConfigurableEventFilter, MaybeRefOrGetter } from '@vueuse/shared'
import { ref } from "vue";

export type UseMouseCoordType = 'page' | 'client' | 'screen' | 'movement'
export type UseMouseSourceType = 'mouse' | 'touch' | null
export type UseMouseEventExtractor = (event: MouseEvent | Touch) => [x: number, y: number] | null | undefined

export interface UseMouseOptions extends ConfigurableWindow, ConfigurableEventFilter {
	/**
	 * Mouse position based by page, client, screen, or relative to previous position
	 *
	 * @default 'page'
	 */
	type?: UseMouseCoordType | UseMouseEventExtractor

	/**
	 * Listen events on `target` element
	 *
	 * @default 'Window'
	 */
	target?: MaybeRefOrGetter<Window | EventTarget | null | undefined>

	/**
	 * Listen to `touchmove` events
	 *
	 * @default true
	 */
	touch?: boolean

	/**
	 * Listen to `scroll` events on window, only effective on type `page`
	 *
	 * @default true
	 */
	scroll?: boolean

	/**
	 * Reset to initial value when `touchend` event fired
	 *
	 * @default false
	 */
	resetOnTouchEnds?: boolean

	/**
	 * Initial values
	 */
	initialValue?: Position
}

const UseMouseBuiltinExtractors: Record<UseMouseCoordType, UseMouseEventExtractor> = {
	page: event => [event.pageX, event.pageY],
	client: event => [event.clientX, event.clientY],
	screen: event => [event.screenX, event.screenY],
	movement: event => (event instanceof Touch
	                    ? null
	                    : [event.movementX, event.movementY]
	),
} as const

/**
 * Reactive mouse position.
 *
 * @see https://vueuse.org/useMouse
 * @param options
 */
export function useMouseFixed(options: UseMouseOptions = {}) {
	const {
		type = 'page',
		touch = true,
		resetOnTouchEnds = false,
		initialValue = { x: 0, y: 0 },
		window = defaultWindow,
		target = window,
		scroll = true,
		eventFilter,
	} = options

	let _prevMouseEvent: MouseEvent | null = null
	let _prevScrollX = 0
	let _prevScrollY = 0

	const x = ref(initialValue.x)
	const y = ref(initialValue.y)
	const sourceType = ref<UseMouseSourceType>(null)

	const extractor = typeof type === 'function'
	                  ? type
	                  : UseMouseBuiltinExtractors[type]

	const mouseHandler = (event: MouseEvent) => {
		const result = extractor(event)
		_prevMouseEvent = event

		if (result) {
			[x.value, y.value] = result
			sourceType.value = 'mouse'
		}

		if (window) {
			_prevScrollX = window.scrollX
			_prevScrollY = window.scrollY
		}
	}

	const touchHandler = (event: TouchEvent) => {
		if (event.touches.length > 0) {
			const result = extractor(event.touches[0])
			if (result) {
				[x.value, y.value] = result
				sourceType.value = 'touch'
			}
		}
	}

	const scrollHandler = () => {
		if (!_prevMouseEvent || !window)
			return
		const pos = extractor(_prevMouseEvent)

		if (_prevMouseEvent instanceof MouseEvent && pos) {
			x.value = pos[0] + window.scrollX - _prevScrollX
			y.value = pos[1] + window.scrollY - _prevScrollY
		}
	}

	const reset = () => {
		x.value = initialValue.x
		y.value = initialValue.y
	}

	const mouseHandlerWrapper = eventFilter
	                            ? (event: MouseEvent) => eventFilter(() => mouseHandler(event), {} as any)
	                            : (event: MouseEvent) => mouseHandler(event)

	const touchHandlerWrapper = eventFilter
	                            ? (event: TouchEvent) => eventFilter(() => touchHandler(event), {} as any)
	                            : (event: TouchEvent) => touchHandler(event)

	const scrollHandlerWrapper = eventFilter
	                             ? () => eventFilter(() => scrollHandler(), {} as any)
	                             : () => scrollHandler()

	if (target) {
		const listenerOptions = { passive: true }
		useEventListener(target, ['mousemove', 'dragover'], mouseHandlerWrapper, listenerOptions)
		if (touch && type !== 'movement') {
			useEventListener(target, ['touchstart', 'touchmove'], touchHandlerWrapper, listenerOptions)
			if (resetOnTouchEnds)
				useEventListener(target, 'touchend', reset, listenerOptions)
		}
		if (scroll && type === 'page')
			useEventListener(window, 'scroll', scrollHandlerWrapper, { passive: true })
	}

	return {
		x,
		y,
		sourceType,
	}
}

export type UseMouseReturn = ReturnType<typeof useMouseFixed>