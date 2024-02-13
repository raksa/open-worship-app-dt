import { redirect } from 'react-router-dom';

export default function RedirectTo({ to }: {
    to: string,
}) {
    redirect(to);
    return null;
}
