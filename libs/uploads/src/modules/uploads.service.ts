import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class UploadsService {

    getMulterConfig() {
        return {
          storage: diskStorage({
            destination: './uploads',  // Directory where files will be stored
            filename: (req, file, callback) => {
              const filename = `${Date.now()}${extname(file.originalname)}`;
              callback(null, filename);
            },
          }),
        };
      }
}
