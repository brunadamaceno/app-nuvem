import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { get } from 'http';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('id')
  async findProductById(
    @Query('user_id') user_id: string,
    @Query('product_id') product_id: string,
  ) {
    return await this.productsService.getProductById(
      parseInt(user_id),
      parseInt(product_id),
    );
  }

  @Get('all')
  async findProduct(@Query('user_id') user_id: string) {
    return await this.productsService.getAllProducts(parseInt(user_id));
  }

  @Get('variants')
  async findAllVariantsOfProductOrdered(
    @Query('user_id') user_id: string,
    @Query('product_id') product_id: string,
    @Query('order') order: string,
  ) {
    this.productsService.isOrderValid(order);
    return await this.productsService.getOrderProductByDiscount(
      parseInt(user_id),
      parseInt(product_id),
      order,
    );
  }

  @Post()
  async createProducts(@Body() products: any) {
    return await this.productsService.createProduct(products);
  }
  @Get('/adicionarProduto')
  async createProducts2() {
    await this.productsService.createProduct2();
  }

  @Get('/deletarProdutos')
  async deletarProdutos() {
    await this.productsService.deleteProduct2();
  }
}

//{"user_id":2093261,"token":"02d091207c9bcd84eab408660e5358a6590a72fb"}
// id loja: 124270559
