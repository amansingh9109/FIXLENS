"use client";
import { useParams } from "next/navigation";
import Chat from "@/components/chat";

export default function SessionPage() { const { id } = useParams<{ id: string }>(); return <Chat initialId={id} />; }
