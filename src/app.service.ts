import { CredentialsEntity } from './modules/entities/credentials.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import process from 'process';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  urlAuthorization = 'https://www.nuvemshop.com.br/apps/authorize/token';
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(CredentialsEntity)
    private repository: Repository<CredentialsEntity>,
  ) {}

  async generateAccessCredentials(accessCode: string) {
    const { data } = await lastValueFrom(
      this.httpService.post(this.urlAuthorization, {
        grant_type: 'authorization_code',
        client_id: 5484 || process.env.CLIENT_ID,
        client_secret:
          'b36a92886090d20ac83fffb04f08a68f0d5b6c4b276d85e4' ||
          process.env.CLIENT_SECRET,
        code: accessCode,
      }),
    );
    const { access_token: token, user_id, error_description: error } = data;

    if (!token && !user_id) {
      throw new BadRequestException(error);
    }

    const accessToken = this.repository.create({ user_id, token });
    this.repository.save(accessToken);
    return accessToken;
  }
}
