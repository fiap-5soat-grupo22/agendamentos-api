import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
  Version,
  Req,
  DefaultValuePipe,
  Query,
} from '@nestjs/common';
import { ConsultasService } from './consultas.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IdentityGuard } from '../../infrastructure/guards/identity/identity.guard';
import { FastifyRequest } from 'fastify';
import { Habilidade } from '../../domain/enums/habilidade.enum';
import { Habilidades } from '../../infrastructure/decorators/habilidades.decorators';
import { OnEvent } from '@nestjs/event-emitter';
import { Consulta } from '../../domain/models/consulta.model';

@Controller('consultas')
@ApiTags('Consultas')
@UseGuards(IdentityGuard)
@ApiBearerAuth()
export class ConsultasController {
  @Inject()
  private readonly consultasService: ConsultasService;

  @ApiOperation({
    description: `
    🎯 Cadastra uma solicitação de agendamento de consulta em um horário disponível de um médico.
    🔐 Autenticação com JWT necessária
    🙎 Operação apenas para pacientes
    
    Regras:
    
    📨 Este serviço é assíncrono, ou seja, após a sua execução a confirmação se dará através do GET na API de Consultas.
    📌 O Horário deverá estar disponível ainda.

    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitação de consulta criada',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados informados na requisição inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Dados informados na requisição inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @Habilidades(Habilidade.Paciente)
  @Version('1')
  @Post()
  createV1(
    @Req() request: FastifyRequest,
    @Body() createConsultaDto: CreateConsultaDto,
  ) {
    return this.consultasService.scheduling(
      createConsultaDto,
      request['cliente'],
    );
  }

  @ApiOperation({
    description: `
    🎯 Lista as consultas agendadas para um médico
    🔐 Autenticação com JWT necessária
    🧑‍⚕️🙎 Operação para médicos e pacientes
    
    Regras:
    
    📌 Cada cliente (Médico ou Paciente) só pode visualizar Consultas que ele está envolvido.

    `,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    example: 0,
    description: `
    Início da paginação
    `,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    example: 10,
    description: `
    Quantidade de registros por página
  `,
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    example: 'inicio,fim,medico,paciente,situacao',
    description: `
    Campos retornados, separados por virgula. Ex: inicio,fim
    `,
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description: `
      Campos de filtros, no formato chave valor separados por vírgulas. Ex: medico.crm=1234
      `,
  })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na listagem dos hosrários.',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum horário encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @ApiBearerAuth()
  @Habilidades(Habilidade.Paciente, Habilidade.Medico)
  @Version('1')
  @Get()
  findAllV1(
    @Query('skip', new DefaultValuePipe(0)) skip: string,
    @Query('take', new DefaultValuePipe(10)) take: string,
    @Query('fields') fields: string,
    @Query('filters', new DefaultValuePipe('situacao=agendada'))
    filters: string,
  ) {
    return this.consultasService.findAll(skip, take, fields, filters);
  }

  @ApiOperation({
    description: `
    🎯 Lista uma consulta específica
    🔐 Autenticação com JWT necessária
    🧑‍⚕️🙎 Operação para médicos e pacientes
    
    Regras:
    
    📌 Cada cliente (Médico ou Paciente) só pode visualizar Consultas que ele está envolvido.

    `,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Código da consulta' })
  @ApiQuery({
    name: 'fields',
    required: false,
    example: 'inio,fim,situacao',
    description: `
    Campos retornados, separados por virgula. Ex: inicio,fim
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na visualização da Consulta.',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhuma consulta encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @ApiBearerAuth()
  @Habilidades(Habilidade.Paciente, Habilidade.Medico)
  @Version('1')
  @Get(':uid')
  findOneV1(
    @Param('uid') uid: string,
    @Query('fields', new DefaultValuePipe('inicio,fim,situacao'))
    fields: string,
  ) {
    return this.consultasService.findOne(uid, fields);
  }

  @ApiOperation({
    description: `
    🎯 Altera um horário
    🔐 Autenticação com JWT necessária
    🧑‍⚕️ Operação para médicos
    
    Regras:
    
    📌 Apenas o médico ou paciente que criou a consulta, pode apagá-la.
    📌 Só é permitida a alteração da situação.

    `,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Código do horário' })
  @ApiBody({ type: UpdateConsultaDto })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na atualização da consulta.',
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhuma consulta encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @ApiBearerAuth()
  @Habilidades(Habilidade.Medico, Habilidade.Paciente)
  @Version('1')
  @Patch(':uid')
  updateV1(
    @Req() request: FastifyRequest,
    @Param('uid') uid: string,
    @Body() updateConsultaDto: UpdateConsultaDto,
  ) {
    return this.consultasService.update(
      uid,
      updateConsultaDto,
      request['cliente'],
    );
  }

  @ApiOperation({
    description: `
    🎯 Remove um horário
    🔐 Autenticação com JWT necessária
    🧑‍⚕️ Operação para médicos
    
    Regras:
    
    📌 Apenas o médico ou paciente que criou a consulta, pode apagá-la.
    📌 Após a deleção, o horário fica livre novamente, caso seja uma data futura.

    `,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Código do horário' })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na deleção da consulta.',
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhuma consulta encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @ApiBearerAuth()
  @Habilidades(Habilidade.Medico, Habilidade.Paciente)
  @Version('1')
  @Delete(':uid')
  remove(@Req() request: FastifyRequest, @Param('uid') uid: string) {
    return this.consultasService.remove(uid, request['cliente']);
  }

  @OnEvent('consulta.solicitada', { async: false })
  handleConsultaSolicitadaEvent(payload: Consulta) {
    console.info(payload);
    return this.consultasService.create(payload);
  }
}
