import { useEffect } from "react";

export function useScrollSelectedSearchResultIntoView(selectedSearchResultIndex: number) {
	useEffect(() => {
		scrollIntoView(selectedSearchResultIndex);
	}, [selectedSearchResultIndex]);
}

function scrollIntoView(selectedIndex: number) {
	const searchResultElement = document.querySelector(
		`[data-search-result-index="${selectedIndex}"]`
	);
	searchResultElement?.scrollIntoView({ behavior: "auto", block: "nearest" });
}
