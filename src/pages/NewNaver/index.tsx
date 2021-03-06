import React, { useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { useHistory } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import * as Yup from 'yup';

import { useNaver } from '../../contexts/NaverContext';
import getValidationErrors from '../../utils/getValidationErrors';

import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Content, HeaderContent } from './styles';
import api from '../../services/api';

interface ICreateNaverFormData {
  job_role: string;
  admission_date: Date;
  birthdate: Date;
  project: string;
  name: string;
  url: string;
}

const NewNaver: React.FC = () => {
  const history = useHistory();
  const formRef = useRef<FormHandles>(null);

  const { openModalSucess } = useNaver();

  const handleSubmit = useCallback(
    async (data: ICreateNaverFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          job_role: Yup.string().required('Cargo obrigatório'),
          birthdate: Yup.string().required(
            'Data de nascimento. Ex: 00/00/0000',
          ),
          admission_date: Yup.string().required(
            'Data que entrou na empresa. Ex: 00/00/0000',
          ),
          project: Yup.string().required('Campo obrigatório'),
          url: Yup.string()
            .url('Coloque um link válido')
            .required('Coloque um link válido'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await api.post('/navers', {
          ...data,
          birthdate: format(new Date(data.birthdate), 'dd-MM-yyyy'),
          admission_date: format(new Date(data.admission_date), 'dd-MM-yyyy'),
        });

        openModalSucess({
          title: 'Naver criado',
          message: 'Naver criado com sucesso',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
          return;
        }

        alert('Falha ao tentar cadastrar um naver');
      }
    },
    [openModalSucess],
  );

  return (
    <Container>
      <Header />

      <Content>
        <HeaderContent>
          <FaChevronLeft onClick={() => history.goBack()} />
          <h2>Adicionar Naver</h2>
        </HeaderContent>
        <Form ref={formRef} onSubmit={handleSubmit}>
          <div>
            <Input name="name" placeholder="Nome" />
            <Input name="job_role" placeholder="Cargo" />
          </div>

          <div>
            <Input
              name="birthdate"
              placeholder="Data de nascimento"
              type="date"
            />
            <Input
              name="admission_date"
              placeholder="Data que iniciou na empresa"
              type="date"
            />
          </div>

          <div>
            <Input name="project" placeholder="Projetos que participou" />
            <Input name="url" placeholder="URL da foto do Naver" />
          </div>

          <Button type="submit">Salvar</Button>
        </Form>
      </Content>
    </Container>
  );
};

export default NewNaver;
