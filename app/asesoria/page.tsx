import AdviceChat from '@/components/advice-chat';
import { families, products } from '@/lib/catalog';

export const metadata = { title: 'Asesoría de equipo' };
export default function AdvicePage() {
  const styles = [...new Set(products.flatMap((product) => product.style))].sort((a, b) => a.localeCompare(b, 'es'));
  return <AdviceChat families={families} styles={styles} />;
}
