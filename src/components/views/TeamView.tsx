import { Team } from "@/lib/footballDataApi";

export interface TeamViewProps {
	teams: Team[];
}

export default function TeamView({ teams }: TeamViewProps) {}
