import { redirect } from 'next/navigation';

export default function TicketReviewPage({ params }: { params: { id: string } }){
    redirect(`/review/${params.id}`);
}