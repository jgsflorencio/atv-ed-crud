import { connectDB } from './db/connection';
import { 
  createUser, 
  listUsers, 
  getUserById, 
  updateUser, 
  deleteUserById,
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudentById,
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  deleteCourseById,
  createEnrollment,
  listEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollmentById
} from './db/queries';

async function testDatabase() {
  console.log('🚀 Iniciando testes do MongoDB...\n');
  
  try {
    console.log('📡 Conectando ao MongoDB...');
    await connectDB();
    console.log('✅ Conectado com sucesso!\n');

    console.log('═══════════════════════════════════════');
    console.log('📝 TESTE 1: CRUD Users');
    console.log('═══════════════════════════════════════\n');

    console.log('➡️  Criando usuários...');
    const user1 = await createUser('João Silva', 'joao@email.com');
    console.log(`   ✅ Usuário criado: ID=${user1._id}, Nome=${user1.nome}, Email=${user1.email}`);
    
    const user2 = await createUser('Maria Santos', 'maria@email.com');
    console.log(`   ✅ Usuário criado: ID=${user2._id}, Nome=${user2.nome}, Email=${user2.email}\n`);

    console.log('➡️  Listando todos os usuários...');
    const allUsers = await listUsers();
    console.log(`   📋 Total de usuários: ${allUsers.length}`);
    allUsers.forEach((u: any, i: number) => {
      console.log(`   ${i+1}. ${u.nome} (${u.email}) - ID: ${u._id}`);
    });
    console.log('');

    console.log('➡️  Buscando usuário por ID...');
    const foundUser = await getUserById(user1._id.toString());
    console.log(`   🔍 Usuário encontrado: ${foundUser?.nome} - ${foundUser?.email}\n`);

    console.log('➡️  Atualizando usuário...');
    const updatedUser = await updateUser(
      user1._id.toString(), 
      'João Silva Junior', 
      'joao.junior@email.com'
    );
    console.log(`   ✏️  Usuário atualizado: ${updatedUser?.nome} - ${updatedUser?.email}\n`);

    console.log('➡️  Deletando usuário...');
    const deleted = await deleteUserById(user2._id.toString());
    console.log(`   🗑️  Usuário deletado: ID=${deleted?.id}\n`);
    
    const afterDelete = await listUsers();
    console.log(`   📋 Após delete, total de usuários: ${afterDelete.length}\n`);

    console.log('═══════════════════════════════════════');
    console.log('📝 TESTE 2: CRUD Students');
    console.log('═══════════════════════════════════════\n');

    console.log('➡️  Criando estudante...');
    const student = await createStudent('2024001', user1._id.toString());
    console.log(`   ✅ Estudante criado: ID=${student._id}, Matrícula=${student.matricula}`);
    console.log(`   👤 Vinculado ao usuário: ${student.user_id?.nome || 'N/A'}\n`);

    console.log('➡️  Listando todos os estudantes...');
    const allStudents = await listStudents();
    console.log(`   📋 Total de estudantes: ${allStudents.length}`);
    allStudents.forEach((s: any, i: number) => {
      console.log(`   ${i+1}. Matrícula: ${s.matricula}, Usuário: ${s.user_id?.nome || 'N/A'}`);
    });
    console.log('');

    console.log('➡️  Buscando estudante por ID...');
    const foundStudent = await getStudentById(student._id.toString());
    console.log(`   🔍 Estudante encontrado: ${foundStudent?.matricula}`);
    console.log(`   👤 Usuário vinculado: ${foundStudent?.user_id?.nome || 'N/A'}\n`);

    console.log('➡️  Atualizando estudante...');
    const updatedStudent = await updateStudent(
      student._id.toString(),
      '2024002',
      user1._id.toString()
    );
    console.log(`   ✏️  Estudante atualizado: Nova matrícula=${updatedStudent?.matricula}\n`);

    console.log('═══════════════════════════════════════');
    console.log('📝 TESTE 3: CRUD Courses');
    console.log('═══════════════════════════════════════\n');

    console.log('➡️  Criando cursos...');
    const course1 = await createCourse('CC001', 'Banco de Dados');
    console.log(`   ✅ Curso criado: ID=${course1._id}, Código=${course1.codigo}, Nome=${course1.nome}`);
    
    const course2 = await createCourse('CC002', 'Engenharia de Software');
    console.log(`   ✅ Curso criado: ID=${course2._id}, Código=${course2.codigo}, Nome=${course2.nome}\n`);

    console.log('➡️  Listando todos os cursos...');
    const allCourses = await listCourses();
    console.log(`   📋 Total de cursos: ${allCourses.length}`);
    allCourses.forEach((c: any, i: number) => {
      console.log(`   ${i+1}. ${c.codigo} - ${c.nome}`);
    });
    console.log('');

    console.log('➡️  Buscando curso por ID...');
    const foundCourse = await getCourseById(course1._id.toString());
    console.log(`   🔍 Curso encontrado: ${foundCourse?.codigo} - ${foundCourse?.nome}\n`);

    console.log('➡️  Atualizando curso...');
    const updatedCourse = await updateCourse(
      course1._id.toString(),
      'CC003',
      'Banco de Dados Avançado'
    );
    console.log(`   ✏️  Curso atualizado: ${updatedCourse?.codigo} - ${updatedCourse?.nome}\n`);

    console.log('═══════════════════════════════════════');
    console.log('📝 TESTE 4: CRUD Enrollments');
    console.log('═══════════════════════════════════════\n');

    console.log('➡️  Criando matrícula...');
    const enrollment = await createEnrollment(
      student._id.toString(),
      course1._id.toString(),
      '2024.1'
    );
    console.log(`   ✅ Matrícula criada: ID=${enrollment._id}`);
    console.log(`   📚 Curso: ${enrollment.course_id?.nome || 'N/A'}`);
    console.log(`   👨‍🎓 Estudante: ${enrollment.student_id?.matricula || 'N/A'}`);
    console.log(`   📅 Semestre: ${enrollment.semestre}\n`);

    console.log('➡️  Listando todas as matrículas...');
    const allEnrollments = await listEnrollments();
    console.log(`   📋 Total de matrículas: ${allEnrollments.length}`);
    allEnrollments.forEach((e: any, i: number) => {
      console.log(`   ${i+1}. Curso: ${e.course_id?.nome || 'N/A'}`);
      console.log(`      Estudante: ${e.student_id?.matricula || 'N/A'}`);
      console.log(`      Semestre: ${e.semestre}`);
    });
    console.log('');

    console.log('➡️  Buscando matrícula por ID...');
    const foundEnrollment = await getEnrollmentById(enrollment._id.toString());
    console.log(`   🔍 Matrícula encontrada:`);
    console.log(`   📚 Curso: ${foundEnrollment?.course_id?.nome || 'N/A'}`);
    console.log(`   👨‍🎓 Estudante: ${foundEnrollment?.student_id?.matricula || 'N/A'}`);
    console.log(`   📅 Semestre: ${foundEnrollment?.semestre}\n`);

    console.log('➡️  Atualizando matrícula...');
    const updatedEnrollment = await updateEnrollment(
      enrollment._id.toString(),
      student._id.toString(),
      course2._id.toString(),
      '2024.2'
    );
    console.log(`   ✏️  Matrícula atualizada:`);
    console.log(`   📚 Novo curso: ${updatedEnrollment?.course_id?.nome || 'N/A'}`);
    console.log(`   📅 Novo semestre: ${updatedEnrollment?.semestre}\n`);

    console.log('➡️  Deletando matrícula...');
    const deletedEnrollment = await deleteEnrollmentById(enrollment._id.toString());
    console.log(`   🗑️  Matrícula deletada: ID=${deletedEnrollment?.id}\n`);

    console.log('═══════════════════════════════════════');
    console.log('🧹 Limpeza: Deletando dados de teste...');
    console.log('═══════════════════════════════════════\n');

    await deleteCourseById(course1._id.toString());
    await deleteCourseById(course2._id.toString());
    console.log('🗑️  Cursos deletados');

    await deleteStudentById(student._id.toString());
    console.log('🗑️  Estudante deletado');

    await deleteUserById(user1._id.toString());
    console.log('🗑️  Usuário deletado');

    console.log('\n✅ TESTES CONCLUÍDOS COM SUCESSO! 🎉');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES:', error);
    if (error instanceof Error) {
      console.error('Detalhes:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testDatabase();