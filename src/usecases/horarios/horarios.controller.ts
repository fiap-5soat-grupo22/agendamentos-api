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
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
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

@Controller('horarios')
@ApiTags('Horários')
@UseGuards(IdentityGuard)
@ApiBearerAuth()
export class HorariosController {
  @Inject()
  private readonly horariosService: HorariosService;

  @ApiOperation({
    description: `
    🎯 Cadastra um novo horário disponível para um médico
    🔐 Autenticação com JWT necessária
    🧑‍⚕️ Operação apenas para médicos
    
    Regras:
    
    📌 A diferença entre a data inicio e a data fim deve ser de no mínimo 10 minutos
    📌 A data inicio deve ser anterior a data fim
    📌 A data inicio e a data fim devem estar no futuro
    📌 O horário não pode ser criado se o médico já tiver um horário agendado no mesmo período, mas pode encerrar quando começa outro horário ou iniciar quando outro horário termina.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Horário criado',
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
  @Habilidades(Habilidade.Medico)
  @Version('1')
  @Post()
  create(
    @Req() request: FastifyRequest,
    @Body() createHorarioDto: CreateHorarioDto,
  ) {
    return this.horariosService.create(createHorarioDto, request['cliente']);
  }

  @ApiOperation({
    description: `
    🎯 Lista os horários disponíveis para um médico
    🔐 Autenticação com JWT necessária
    🧑‍⚕️🙎 Operação para médicos e pacientes
    
    Regras:
    
    📌 Por padrão traz os horários livres, mas isso pode ser mudado através do campo "filters"

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
    example: 'inicio,fim',
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
    description: 'Nenhum horário encontrado',
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
    @Query('fields', new DefaultValuePipe('inicio,fim')) fields: string,
    @Query('filters', new DefaultValuePipe('situacao=livre')) filters: string,
  ) {
    return this.horariosService.findAll(skip, take, fields, filters);
  }

  @ApiOperation({
    description: `
    🎯 Lista um horário
    🔐 Autenticação com JWT necessária
    🧑‍⚕️🙎 Operação para médicos e pacientes
    
    Regras:
    
    📌 Por padrão traz os campos de data e hora de inicio e fim e situação

    `,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Código do horário' })
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
    description: 'Sucesso na consulta do horário.',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum horário encontrado',
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
    return this.horariosService.findOne(uid, fields);
  }

  @ApiOperation({
    description: `
    🎯 Altera um horário
    🔐 Autenticação com JWT necessária
    🧑‍⚕️ Operação para médicos
    
    Regras:
    
    📌 Apenas o médico que criou o horário, pode alterá-lo
    📌 A diferença entre a data inicio e a data fim deve ser de no mínimo 10 minutos
    📌 A data inicio deve ser anterior a data fim
    📌 A data inicio e a data fim devem estar no futuro
    📌 O horário não pode ser criado se o médico já tiver um horário agendado no mesmo período, mas pode encerrar quando começa outro horário ou iniciar quando outro horário termina.

    `,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Código do horário' })
  @ApiBody({ type: UpdateHorarioDto })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na atualização do horário.',
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
    description: 'Nenhum horário encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @ApiBearerAuth()
  @Habilidades(Habilidade.Medico)
  @Version('1')
  @Patch(':uid')
  updateV1(
    @Req() request: FastifyRequest,
    @Param('uid') uid: string,
    @Body() updateHorarioDto: UpdateHorarioDto,
  ) {
    return this.horariosService.update(
      uid,
      updateHorarioDto,
      request['cliente'],
    );
  }

  @ApiOperation({
    description: `
    🎯 Remove um horário
    🔐 Autenticação com JWT necessária
    🧑‍⚕️ Operação para médicos
    
    Regras:
    
    📌 Apenas o médico que criou o horário, pode apagá-lo.
    📌 Horários com situação Reservado, também apagarão a consulta agendada e haverá comunicação para o paciente.

    `,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Código do horário' })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na deleção do horário.',
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
    description: 'Nenhum horário encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @ApiBearerAuth()
  @Habilidades(Habilidade.Medico)
  @Version('1')
  @Delete(':uid')
  remove(@Req() request: FastifyRequest, @Param('uid') uid: string) {
    return this.horariosService.remove(uid, request['cliente']);
  }

  @OnEvent('consulta.criada', { async: false })
  handleConsultaCriadaEvent(payload: object) {
    return this.horariosService.updateStatusConsultaCriada(payload['uid']);
  }
}
