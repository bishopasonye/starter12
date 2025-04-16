import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  Res,
  UploadedFiles,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { randomInt, randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { ObjectReturnType, serviceResponse } from '@app/service';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('upload')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('file')
  @UseInterceptors(FilesInterceptor('files', 10, getMulterConfig()))
  uploadFile(
    @Request() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ):ObjectReturnType {
    // Get the base URL of the current request (protocol + host)
    const host = req.protocol + '://' + req.get('host'); 

    // Construct the file URLs
    const fileUrls = files?.map((file) => ({
      originalname: file.originalname,
      url: `${host}/v1/upload/file/${file.filename}`, // Full URL for the file
    }));

    if (!fileUrls || fileUrls.length === 0) {
      return serviceResponse({
        message: 'No files were uploaded.',
        data: fileUrls,
        status:fileUrls?true:false
      });
    }
    return serviceResponse({
      message: 'Files uploaded',
      data: fileUrls,
      status:fileUrls?true:false
    });
  }

  @Get('file/:filename')
  getFile(@Param('filename') filename: string, @Res() res: any) {
    const filePath = join(__dirname, '..', 'uploads', filename); // Get the full file path
  
    // Check if the file exists
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    return  res.sendFile(filePath);
  }
}

function getMulterConfig() {
  return {
    storage: diskStorage({
      destination: './uploads', // Directory where files will be stored
      filename: (req, file, callback) => {
        const id =
          randomInt(999) +
          randomUUID().replace(/\D/g, '').substring(0, 3) +
          Date.now().toString().substring(0, 3);
        const filename = `${id}-${file.originalname.trim().replace(/ /g, '')}`;
        callback(null, filename);
      },
    }),
  };
}
