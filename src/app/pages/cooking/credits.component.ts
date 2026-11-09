import { Component } from '@angular/core';
import { TPipe } from '../../feature/i18n/t.pipe';
@Component({
	imports: [TPipe],
	template: `<article class="cook-prose">
		<h1>{{ 'Licenses and credits' | t }}</h1>
		<p>
			{{
				'Cooking is free software under the General Public License, version 3 or later. Third-party packages retain their own licenses.'
					| t
			}}
		</p>
		<h2>{{ 'Type and design' | t }}</h2>
		<p>
			{{
				'Fraunces and Inter use the SIL Open Font License. Interface icons come from Iconoir under the MIT License.'
					| t
			}}
		</p>
		<p>
			{{
				'The light theme uses Better Design’s Editorial Warm foundation. Chocolate & Cream dark mode uses its Sonic Lofi palette.'
					| t
			}}
		</p>
		<h2>{{ 'Images' | t }}</h2>
		<p>
			{{
				'The generic Cooking photographs were generated with AI. They illustrate the brand and are not lesson instructions.'
					| t
			}}
		</p>
	</article>`,
})
export class CreditsComponent {}
