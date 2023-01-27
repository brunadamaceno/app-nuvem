import { HttpService } from '@nestjs/axios';
import { CredentialsEntity } from './../entities/credentials.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface IProducts {
  product_id: number;
  valueOfDiscount: string;
  id: number;
  price: string;
  promotional_price: string;
  stock: number;
}
@Injectable()
export class ProductsService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(CredentialsEntity)
    private credentialsRepository: Repository<CredentialsEntity>,
  ) {}
  async getAllProducts(userId: number) {
    const user = await this.isUserValid(userId);
    const { user_id, token } = user;

    const url = `https://api.nuvemshop.com.br/v1/${user_id}/products`;

    const { data } = await this.getHttpRequest(url, token);
    return data;
  }
  async isUserValid(userId: number) {
    const user = await this.credentialsRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User not found!`);
    }
    return user;
  }

  async getHttpRequest(url: string, token: string) {
    return await this.httpService
      .get(url, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Awesome App {samela.silva@nuvemshop.com.br}',
          Authentication: `bearer ${token}`,
        },
      })
      .toPromise();
  }

  getValueOfDiscountAndIdVariants(data: []) {
    const arrayOfDiscountAndId = [];
    data.map((product) => {
      const { id, product_id, price, promotional_price, stock } = product;
      const valueOfDiscount = !promotional_price
        ? 0
        : (price - promotional_price).toFixed(2);
      arrayOfDiscountAndId.push({
        product_id,
        valueOfDiscount,
        id,
        price,
        promotional_price,
        stock,
      });
    });
    return arrayOfDiscountAndId;
  }

  getCompareOfProductsToMajor(product1: IProducts, product2: IProducts) {
    if (product1.valueOfDiscount > product2.valueOfDiscount) return -1;
    if (product1.valueOfDiscount < product2.valueOfDiscount) return 1;
    if (product1.valueOfDiscount === product2.valueOfDiscount) return 0;
    if (!product1.valueOfDiscount) return +1;
  }

  getCompareOfProductsToMinor(product1: IProducts, product2: IProducts) {
    if (product1.valueOfDiscount < product2.valueOfDiscount) return -1;
    if (product1.valueOfDiscount > product2.valueOfDiscount) return 1;
    if (product1.valueOfDiscount === product2.valueOfDiscount) return 0;
    if (!product1.valueOfDiscount) return +1;
  }

  getOrderProducts(data: [], order: string) {
    const arrayDiscountAndIdVariants =
      this.getValueOfDiscountAndIdVariants(data);
    if (order === 'major') {
      return arrayDiscountAndIdVariants.sort(this.getCompareOfProductsToMajor);
    }
    return arrayDiscountAndIdVariants.sort(this.getCompareOfProductsToMinor);
  }

  isOrderValid(order: string) {
    if (!order) {
      throw new BadRequestException(
        'Params were not passed! You must pass params like order=minor or order=major',
      );
    } else if (
      order.toLocaleLowerCase() !== 'minor' &&
      order.toLocaleLowerCase() !== 'major'
    ) {
      throw new BadRequestException(
        'You passed wrong parameter to order the products. This must be minor or major',
      );
    }
  }

  async getProductById(userId: number, product_id: number) {
    const user = await this.isUserValid(userId);
    const { user_id, token } = user;

    const url = `https://api.nuvemshop.com.br/v1/${user_id}/products/${product_id}`;

    const { data } = await this.getHttpRequest(url, token);
    return data;
  }

  async getOrderProductByDiscount(
    userId: number,
    product_id: number,
    order?: string,
  ) {
    const user = await this.isUserValid(userId);
    const { user_id, token } = user;

    const url = `https://api.nuvemshop.com.br/v1/${user_id}/products/${product_id}/variants?fields=id,product_id,price,promotional_price,stock`;

    const { data: arrayOfProductVariants } = await this.getHttpRequest(
      url,
      token,
    );

    if (arrayOfProductVariants.length > 1) {
      return this.getOrderProducts(arrayOfProductVariants, order);
    }
    return arrayOfProductVariants;
  }

  async postHttpRequest(url: string, products: any, token: string) {
    return await this.httpService
      .post(url, products, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Awesome App {samela.silva@nuvemshop.com.br}',
          Authentication: `bearer ${token}`,
        },
      })
      .toPromise();
  }
  async createProduct(products: any) {
    const user = await this.isUserValid(2093261);
    const { user_id, token } = user;

    const url = `https://api.nuvemshop.com.br/v1/${user_id}/products`;
    console.log(token, user_id);
    console.log(await this.postHttpRequest(url, products, token));
    //await this.postHttpRequest(url, products, token);
    //return data;
  }

  async deleteProduct2() {
    const user = await this.isUserValid(2093261);
    const { user_id, token } = user;

    const url = `https://api.nuvemshop.com.br/v1/${user_id}/products`;
    console.log(token, user_id);
    const data = await this.getAllProducts(user_id);
    data.forEach(async (produto) => {
      await this.httpService
        .delete(`${url}/${produto.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Awesome App {samela.silva@nuvemshop.com.br}',
            Authentication: `bearer ${token}`,
          },
        })
        .toPromise();
    });

    //await this.postHttpRequest(url, products, token);
    //return data;
  }

  async createProduct2() {
    const user = await this.isUserValid(2093261);
    const { user_id, token } = user;
    for (let i = 0; i < 3; i++) {
      const produtos = {
        images: [
          {
            src: 'http://images1.wikia.nocookie.net/__cb20101106022321/pokemon/images/f/f1/UltraBallArt.png',
          },
        ],
        name: {
          en: 'Ultra Ball aaa' + i,
          es: 'Ultra Ball aaa' + i,
          pt: 'Ultra Ball aaa' + i,
        },
        video_url: 'https://www.youtube.com/watch?v=57aG16_gQcU',
        variants: [
          {
            price: '10.00',
            stock_management: true,
            stock: 12,
            weight: '2.00',
            cost: '10.99',
          },
        ],
        categories: [13820077, 13820077],
      };

      const url = `https://api.nuvemshop.com.br/v1/${user_id}/products`;
      console.log(token, user_id);
      await this.postHttpRequest(url, produtos, token);
      //return data;
    }
  }
}
