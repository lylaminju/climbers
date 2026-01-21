<script lang="ts">
	import {
		EnvelopeOutline,
		GithubSolid,
		InstagramSolid,
		LinkedinSolid,
		XSolid
	} from 'flowbite-svelte-icons';
</script>

<footer
	class="mt-5 flex flex-col items-center gap-2 bg-gray-200 p-3 text-gray-500 sm:mt-10 sm:justify-center sm:gap-3 sm:p-5"
>
	<div class="flex items-center justify-center gap-3">
		<a href="mailto:lylaminju@gmail.com">
			<EnvelopeOutline class="h-[25px] w-[25px] hover:text-black" />
		</a>
		<a href="https://instagram.com/mjuuclimb" target="_blank">
			<InstagramSolid class="h-[25px] w-[25px] hover:text-black" />
		</a>
		<a href="https://x.com/lylaminju" target="_blank">
			<XSolid class="h-[20px] w-[20px] hover:text-black" />
		</a>
		<a href="https://www.linkedin.com/in/lylaminju" target="_blank">
			<LinkedinSolid class="rounded-md bg-gray-300 p-[1px] hover:text-black" />
		</a>
		<a href="https://github.com/lylaminju/climbers" target="_blank">
			<GithubSolid class="h-[22px] w-[22px] hover:text-black" />
		</a>
	</div>

	<p class="text-center text-xs">© 2025 - 2026 Minju Park. All rights reserved.</p>
</footer>
