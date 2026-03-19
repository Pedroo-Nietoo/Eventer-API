import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
 private readonly logger = new Logger(StripeService.name);
 private stripe: Stripe;

 constructor(private readonly configService: ConfigService) {
  this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'), {
   apiVersion: '2026-02-25.clover',
  });
 }

 async createCheckoutSession(orderId: string, ticketName: string, unitPrice: number, quantity: number) {
  try {
   return await this.stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
     {
      price_data: {
       currency: 'brl',
       product_data: {
        name: `Ingresso - ${ticketName}`,
       },
       unit_amount: Math.round(unitPrice * 100), //* Stripe exige centavos
      },
      quantity: quantity,
     },
    ],
    mode: 'payment',
    success_url: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/events/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/events/canceled`,
    metadata: {
     orderId: orderId, //* Metadado vital para o Webhook saber qual Order atualizar
    },
   });
  } catch (error) {
   this.logger.error('Erro ao criar sessão no Stripe', error);
   throw new InternalServerErrorException('Falha ao comunicar com o gateway de pagamento.');
  }
 }

 // Você precisará disso para o Webhook depois
 constructEvent(payload: Buffer, signature: string): Stripe.Event {
  return this.stripe.webhooks.constructEvent(
   payload,
   signature,
   this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
  );
 }
}