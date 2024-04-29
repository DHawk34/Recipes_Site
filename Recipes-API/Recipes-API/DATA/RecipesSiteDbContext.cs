using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Recipes_API.Models;

namespace Recipes_API.DATA;

public partial class RecipesSiteDbContext : DbContext
{
    public RecipesSiteDbContext()
    {
    }

    public RecipesSiteDbContext(DbContextOptions<RecipesSiteDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Image> Images { get; set; }

    public virtual DbSet<Ingredient> Ingredients { get; set; }

    public virtual DbSet<NationalCuisine> NationalCuisines { get; set; }

    public virtual DbSet<Recipe> Recipes { get; set; }

    public virtual DbSet<RecipeGroup> RecipeGroups { get; set; }

    public virtual DbSet<RecipeIngredient> RecipeIngredients { get; set; }

    public virtual DbSet<RecipeInstruction> RecipeInstructions { get; set; }

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
//        => optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=recipe_site;Username=neo;Password=admin;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Image>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("images_pk");

            entity.ToTable("images");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ContentType).HasColumnName("contenttype");
            entity.Property(e => e.Data).HasColumnName("data");
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pk_id_ingredient");

            entity.ToTable("ingredients");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<NationalCuisine>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("national_cuisine_pk");

            entity.ToTable("national_cuisine");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("recipes_pk");

            entity.ToTable("recipes");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CookTime).HasColumnName("cooktime");
            entity.Property(e => e.CreationTime).HasColumnName("creationtime");
            entity.Property(e => e.Difficult).HasColumnName("difficult");
            entity.Property(e => e.FinishImage).HasColumnName("finishimage");
            entity.Property(e => e.Group).HasColumnName("group");
            entity.Property(e => e.Hot).HasColumnName("hot");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.NationalCuisine).HasColumnName("nationalcuisine");
            entity.Property(e => e.PortionCount).HasColumnName("portioncount");

            entity.HasOne(d => d.FinishImageNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.FinishImage)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_recipe_group_images_0");

            entity.HasOne(d => d.GroupNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.Group)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_recipe_group_recipe_group_1");

            entity.HasOne(d => d.NationalCuisineNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.NationalCuisine)
                .HasConstraintName("fk_recipe_group_national_cuisine_2");
        });

        modelBuilder.Entity<RecipeGroup>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("recipe_group_pk");

            entity.ToTable("recipe_group");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<RecipeIngredient>(entity =>
        {
            entity.HasKey(e => new { e.Recipe, e.Ingredient }).HasName("sqlite_autoindex_recipe-ingredients_1");

            entity.ToTable("recipe-ingredients");

            entity.Property(e => e.Recipe).HasColumnName("recipe");
            entity.Property(e => e.Ingredient).HasColumnName("ingredient");
            entity.Property(e => e.Amount).HasColumnName("amount");

            entity.HasOne(d => d.IngredientNavigation).WithMany(p => p.RecipeIngredients)
                .HasForeignKey(d => d.Ingredient)
                .HasConstraintName("fk_ingredient");

            entity.HasOne(d => d.RecipeNavigation).WithMany(p => p.RecipeIngredients)
                .HasForeignKey(d => d.Recipe)
                .HasConstraintName("fk_recipe");
        });

        modelBuilder.Entity<RecipeInstruction>(entity =>
        {
            entity.HasKey(e => new { e.Recipe, e.Step }).HasName("sqlite_autoindex_recipe-instructions_1");

            entity.ToTable("recipe-instructions");

            entity.Property(e => e.Recipe)
                .ValueGeneratedOnAdd()
                .HasColumnName("recipe");
            entity.Property(e => e.Step).HasColumnName("step");
            entity.Property(e => e.InstructionImage).HasColumnName("instructionimage");
            entity.Property(e => e.InstructionText).HasColumnName("instructiontext");

            entity.HasOne(d => d.InstructionImageNavigation).WithMany(p => p.RecipeInstructions)
                .HasForeignKey(d => d.InstructionImage)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_recipe-ingredients_images_0");

            entity.HasOne(d => d.RecipeNavigation).WithMany(p => p.RecipeInstructions)
                .HasForeignKey(d => d.Recipe)
                .HasConstraintName("fk_recipe-ingredients_recipes_1");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}