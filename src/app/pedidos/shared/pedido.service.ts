import { CarrinhoService } from './carrinho.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Key } from 'protractor';
import { FirebasePath } from 'src/app/core/shared/firebase-path';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  public static TIPO_FORMA_PAGAMENTO = {
    DINHEIRO: 1,
    CARTAO: 2
  };
  
  public static STATUS = {
    ENVIADO: 0,
    CONFIRMADO: 1,
    SAIU_PARA_ENTREGA: 2,
    ENTREGUE: 3
  };

  constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth,
    private carrinhoService: CarrinhoService, private dateFormat: DatePipe) {}
 
   gerarPedido(pedido: any){

   }
   
   private criarObjetoPedido(pedido:any){
     const numeroPedido = '#' + this.dateFormat.transform(new Date(), 'ddMMyyyyHHmmss');
     const dataPedido = this.dateFormat.transform(new Date(), 'dd/MM/yyyy');
     let pedidoRef = {
       numero: numeroPedido,
       status: PedidoService.STATUS.ENVIADO,
       data: dataPedido,
       formPagamento: pedido.formPagamento,
       trocoPara: pedido.trocoPara,
       tipoCartao: pedido.tipoCartao,
       enderecoEntrega: pedido.enderecoEntrega,
       usuarioKey: this.afAuth.auth.currentUser.uid,
       usuarioNome: this.afAuth.auth.currentUser.displayName,
       //TECNICA DE FILTRO DE VARIOS CAMPOS
       usuarioStatus: this.afAuth.auth.currentUser.uid . '_' + PedidoService.STATUS.ENVIADO,
       total: pedido.total
     }

   }

   getStatusNome(status: number){
     switch (status){
    case PedidoService.STATUS.ENVIADO:
     return 'Aguardando confirmação';
    case PedidoService.STATUS.CONFIRMADO:
     return 'Em preparação';
    case PedidoService.STATUS.SAIU_PARA_ENTREGA:
     return 'Saiu para entrega';
    case PedidoService.STATUS.ENTREGUE:
     return 'Entregue';
   }
   }

   getFormaPagamentoNome(paymentType: number){
    switch(paymentType){
      case PedidoService.TIPO_FORMA_PAGAMENTO.DINHEIRO:
      return 'Dinheiro';
      case PedidoService.TIPO_FORMA_PAGAMENTO.CARTAO:
      return 'Cartão de credito/debito'
    }
   }

   getAll(){
     return this.db.list(FirebasePath.PEDIDOS,
      q => q.orderByChild('usuarioKey').endAt(this.afAuth.auth.currentUser.uid))
      .snapshotChanges().pipe(
        map(changes => {
          return changes.map(m => ({ key: m.payload.key, ...m.payload.val() }))
        })
      )

   }

   getAllAbertos(){
     const usuariosStatus = this.afAuth.auth.currentUser.uid + '_' + PedidoService.STATUS.SAIU_PARA_ENTREGA
     return this.db.list(FirebasePath.PEDIDOS,
      q => q.orderByChild('usuarioStatus').endAt(usuariosStatus))
      .snapshotChanges().pipe(
        map(changes => {
          return changes.map(m => ({ key: m.payload.key, ...m.payload.val()
          }))
        }));
      }

   getAllProdutos(key: string){
    const path = `${FirebasePath.PEDIDOS_PRODUTOS}${key}`;
    return this.db.list(path).snapshotChanges().pipe(
    map(changes => {
      return changes.map(m => ({key: m.payload.key, ...m.payload.val() }));
    })
    );
   }
}
